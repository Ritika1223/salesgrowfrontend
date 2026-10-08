import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE, API_CHAT, getApiOrigin } from "../../../config/api";
import { authJsonHeaders, getStoredAuthUser } from "../../../utils/auth";

const DEMO_SCANNER = "/images/demo-scanner.svg";

function getImageUrl(url) {
  if (!url) return DEMO_SCANNER;
  if (/^https?:\/\//i.test(url)) return url;
  const origin = getApiOrigin(API_BASE);
  return `${origin}${url.startsWith("/") ? url : "/" + url}`;
}

export default function BecomeHostModal({ open, onClose, onSubmitted }) {
  const stored = getStoredAuthUser() || {};
  const [bank, setBank] = useState(null);
  const [bankLoading, setBankLoading] = useState(true);
  const [name, setName] = useState(stored.name || "");
  const [email, setEmail] = useState(stored.email || "");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [upiId, setUpiId] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [doneMessage, setDoneMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setDone(false);
    setAttachment(null);
    setBankLoading(true);
    axios
      .get(`${API_CHAT}/bank`, { headers: authJsonHeaders() })
      .then((res) => setBank(res.data?.data || null))
      .catch(() => setBank(null))
      .finally(() => setBankLoading(false));
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const rupees = Number(amount);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email ID is mandatory");
      return;
    }
    if (!rupees || rupees < 1) {
      setError("Enter a valid amount");
      return;
    }
    if (!transactionId.trim() && !upiId.trim()) {
      setError("Enter transaction ID or UPI ID");
      return;
    }
    if (!attachment) {
      setError("Upload payment screenshot");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("amount", rupees);
    formData.append("transactionId", transactionId.trim());
    formData.append("upiId", upiId.trim());
    formData.append("attachment", attachment);

    try {
      setLoading(true);
      const token = authJsonHeaders().Authorization;
      const res = await axios.post(`${API_BASE}/auth/host-request`, formData, {
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
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-modal">
      <div className="wallet-modal-box payment-modal">
        <button className="wallet-close-btn" onClick={onClose} type="button">
          <i className="bi bi-x-lg"></i>
        </button>

        {done ? (
          <div className="text-center" style={{ padding: "12px 4px 8px" }}>
            <div className="d-flex align-items-center justify-content-center">
              <div className="wallet-modal-icon">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2>Request sent</h2>
            </div>
            <p className="qr-text" style={{ fontWeight: 400, lineHeight: 1.5 }}>
              {doneMessage}
            </p>
            <p className="qr-text" style={{ fontWeight: 400, marginTop: 0 }}>
              Admin will contact you as soon as possible.
            </p>
            <div className="wallet-modal-actions">
              <button type="button" className="wallet-submit-btn" onClick={onClose}>
                OK
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="d-flex align-items-center justify-content-center">
              <div className="wallet-modal-icon">
                <i className="bi bi-broadcast"></i>
              </div>
              <h2>Become a host</h2>
            </div>

            <div className="qr-section">
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
                  <p className="qr-text">Scan QR & complete payment</p>
                  {bank?.upi ? (
                    <div className="upi-box">
                      <span>{bank.upi}</span>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => navigator.clipboard.writeText(bank.upi)}
                      >
                        Copy
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <form className="payment-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  className="wallet-input"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  className="wallet-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email ID</label>
                <input
                  type="email"
                  className="wallet-input"
                  placeholder="Email (mandatory)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                />
              </div>
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  className="wallet-input"
                  placeholder="UPI ID (if no transaction ID)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Attachment (screenshot)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="wallet-input"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  required
                />
              </div>
              {error && <div className="wallet-error">{error}</div>}
              <div className="wallet-modal-actions">
                <button type="button" className="wallet-cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="wallet-submit-btn" disabled={loading}>
                  {loading ? "Submitting..." : "Submit to admin"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
