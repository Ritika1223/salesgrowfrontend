import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE, API_CHAT, getApiOrigin } from "../../../config/api";
import { authJsonHeaders, getStoredAuthUser, getToken } from "../../../utils/auth";

const DEMO_SCANNER = "/images/demo-scanner.svg";
const MIN_INVEST = 50;
const INVEST_STEP = 50;

function getImageUrl(url) {
  if (!url) return DEMO_SCANNER;
  if (/^https?:\/\//i.test(url)) return url;
  const origin = getApiOrigin(API_BASE);
  return `${origin}${url.startsWith("/") ? url : "/" + url}`;
}

export default function FundRequest() {
  const stored = getStoredAuthUser() || {};
  const [bank, setBank] = useState(null);
  const [bankLoading, setBankLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [remark, setRemark] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [doneMessage, setDoneMessage] = useState("");

  useEffect(() => {
    axios
      .get(`${API_CHAT}/bank`, { headers: authJsonHeaders() })
      .then((res) => setBank(res.data?.data || null))
      .catch(() => setBank(null))
      .finally(() => setBankLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!getToken()) {
      setError("Please login first");
      return;
    }

    const paid = Number(amount);
    if (!Number.isFinite(paid) || paid < MIN_INVEST || paid % INVEST_STEP !== 0) {
      setError(`Enter at least $${MIN_INVEST}, in multiples of $${INVEST_STEP}`);
      return;
    }
    if (!transactionId.trim()) {
      setError("Transaction ID is required");
      return;
    }
    if (!transactionPassword.trim()) {
      setError("Transaction password is required");
      return;
    }

    const formData = new FormData();
    formData.append("planName", "INVEST");
    formData.append("name", stored.name || "");
    formData.append("email", stored.email || "");
    formData.append("amount", paid);
    formData.append("transactionId", transactionId.trim());
    formData.append("remark", remark.trim());
    formData.append("transactionPassword", transactionPassword);

    try {
      setLoading(true);
      const token = authJsonHeaders().Authorization;
      const res = await axios.post(`${API_BASE}/plans/plan-request`, formData, {
        headers: {
          ...(token ? { Authorization: token } : {}),
          "Content-Type": "multipart/form-data",
        },
      });
      setDoneMessage(
        res.data?.message ||
          "Admin will contact you as soon as possible. Confirmation time is maximum 20 minutes."
      );
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-plans-page">
      <div className="container-fluid">
        <div className="prox-live-navbar">
          <div className="prox-live-navbar-left">
            <div className="prox-live-logo">
              <i className="bi bi-cash-coin"></i>
            </div>
            <div>
              <h2 className="prox-live-navbar-title">Fund  Request</h2>
              <p className="prox-live-navbar-subtitle">
                Minimum $50. Amount must be a multiple of $50. ROI is 1% daily, Monday to Saturday, for 365 days.
              </p>
            </div>
          </div>
        </div>

        {done ? (
          <div className="income-history-card">
            <h4>Request sent</h4>
            <p>{doneMessage}</p>
            <p>Admin will verify the payment and confirm your request.</p>
          </div>
        ) : (
          <div className="income-history-card fund-request-layout">
            <div className="fund-request-qr">
              {bankLoading ? (
                <div className="wallet-loading">Loading scanner...</div>
              ) : (
                <>
                  <img
                    src={getImageUrl(bank?.qrCode)}
                    alt="Payment scanner"
                    className="payment-qr"
                    onError={(e) => {
                      e.currentTarget.src = DEMO_SCANNER;
                    }}
                  />
                  <p className="qr-text">Scan QR and pay the amount</p>
                  <div className="upi-box">
                    <span>{bank?.upi || "UPI ID not set"}</span>
                    {bank?.upi ? (
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => navigator.clipboard.writeText(bank.upi)}
                      >
                        Copy
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            <form className="payment-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Amount ($)</label>
                <input
                  type="number"
                  className="wallet-input"
                  min={MIN_INVEST}
                  step={INVEST_STEP}
                  placeholder="50, 100, 150..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Transaction ID</label>
                <input
                  type="text"
                  className="wallet-input"
                  placeholder="UTR / Transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Remark</label>
                <input
                  type="text"
                  className="wallet-input"
                  placeholder="Remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Transaction Password</label>
                <input
                  type="password"
                  className="wallet-input"
                  placeholder="Transaction password"
                  value={transactionPassword}
                  onChange={(e) => setTransactionPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="wallet-error">{error}</div>}
              <div className="wallet-modal-actions">
                <button type="submit" className="wallet-submit-btn" disabled={loading}>
                  {loading ? "Submitting..." : "Submit to admin"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
