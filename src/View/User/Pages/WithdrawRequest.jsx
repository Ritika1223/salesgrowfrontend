import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../../config/api";
import { authJsonHeaders, getToken } from "../../../utils/auth";

function toCents(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

function money(value) {
  const amount = toCents(value) / 100;
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function WithdrawRequest() {
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [withdrawStopped, setWithdrawStopped] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    withdrawn: 0,
    pending: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);

  const loadSummary = useCallback(() => {
    if (!getToken()) {
      setSummaryLoading(false);
      return;
    }
    setSummaryLoading(true);
    Promise.allSettled([
      axios.get(`${API_BASE}/plans/getIncomeReport`, { headers: authJsonHeaders() }),
      axios.get(`${API_BASE}/plans/withdraw/history`, { headers: authJsonHeaders() }),
      axios.get(`${API_BASE}/auth/user/me`, { headers: authJsonHeaders() }),
    ]).then(([incomeRes, historyRes, meRes]) => {
      const income = incomeRes.status === "fulfilled" ? incomeRes.value.data?.data : null;
      const rows = historyRes.status === "fulfilled" && Array.isArray(historyRes.value.data?.data)
        ? historyRes.value.data.data
        : [];
      const pending = rows
        .filter((row) => String(row?.status || "").toLowerCase() === "pending")
        .reduce((sum, row) => sum + Number(row.amount || 0), 0);
      setSummary({
        total: Number(income?.TotalEarn || 0),
        withdrawn: Number(income?.TotalWithdraw || 0),
        pending,
      });
      if (meRes.status === "fulfilled") {
        setWithdrawStopped(Boolean(meRes.value.data?.user?.withdrawStopped));
      }
    }).finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!getToken()) {
      setError("Please login first");
      return;
    }
    if (withdrawStopped) {
      setError("Withdrawal is stopped for your account. Please contact admin.");
      return;
    }
    const requestCents = toCents(amount);
    const availableCents = Math.max(
      0,
      toCents(summary.total) - toCents(summary.withdrawn) - toCents(summary.pending)
    );
    if (requestCents > availableCents) {
      setError(
        `Not enough income balance. Available is $${money(availableCents / 100)}.`
      );
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE}/plans/withdraw`,
        {
          amount: Number(amount),
          upiId,
          transactionPassword,
        },
        { headers: authJsonHeaders() }
      );
      setMessage(res.data?.message || "Withdrawal request sent");
      setAmount("");
      setUpiId("");
      setTransactionPassword("");
      loadSummary();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not submit withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const total = toCents(summary.total) / 100;
  const withdrawn = toCents(summary.withdrawn) / 100;
  const pending = toCents(summary.pending) / 100;
  const available = Math.max(0, toCents(total) - toCents(withdrawn) - toCents(pending)) / 100;
  const usdtAmount = Number(amount);
  const deduction =
    Number.isFinite(usdtAmount) && usdtAmount > 0
      ? Math.round(usdtAmount * 10) / 100
      : 0;
  const payout =
    deduction > 0
      ? Math.round((usdtAmount - deduction) * 100) / 100
      : 0;

  return (
    <div className="modern-plans-page">
      <div className="container-fluid">
        <div className="prox-live-navbar">
          <div className="prox-live-navbar-left">
            <div className="prox-live-logo">
              <i className="bi bi-cash-stack"></i>
            </div>
            <div>
              <h2 className="prox-live-navbar-title">Withdrawal Request</h2>
              <p className="prox-live-navbar-subtitle">
                Minimum $5. Request time is 12 AM to 10 AM. 10% is deducted. Credited within 24 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="income-history-card fund-request-form">
          {withdrawStopped ? (
            <p className="prox-live-navbar-subtitle">
              Withdrawal is stopped for your account. Please contact admin.
            </p>
          ) : null}
          <div className="withdraw-summary">
            <div className="withdraw-summary-item">
              <span>Available balance</span>
              <strong>{summaryLoading ? "..." : `$${money(available)}`}</strong>
            </div>
            <div className="withdraw-summary-item">
              <span>Total amount</span>
              <strong>{summaryLoading ? "..." : `$${money(total)}`}</strong>
            </div>
            <div className="withdraw-summary-item">
              <span>Withdrawn</span>
              <strong>{summaryLoading ? "..." : `$${money(withdrawn)}`}</strong>
            </div>
            <div className="withdraw-summary-item">
              <span>Pending</span>
              <strong>{summaryLoading ? "..." : `$${money(pending)}`}</strong>
            </div>
          </div>
          {!summaryLoading && pending > 0 ? (
            <p className="withdraw-inr-note">
              ${money(pending)} is already held by a pending withdrawal, so it is not part of the available balance.
            </p>
          ) : null}
          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Amount (USDT)</label>
              <input
                type="number"
                className="wallet-input"
                placeholder="Minimum $5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="5"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>USDT after 10% charge</label>
              <input
                type="text"
                className="wallet-input"
                value={payout > 0 ? `$${money(payout)}` : ""}
                placeholder="Enter USDT to see amount after 10% charge"
                readOnly
              />
            </div>
            <div className="form-group">
              <label>USDT Address(BEP20)</label>
              <input
                type="text"
                className="wallet-input"
                // placeholder="name@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Transaction Password</label>
              <input
                type="password"
                className="wallet-input"
                value={transactionPassword}
                onChange={(e) => setTransactionPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="wallet-error">{error}</div>}
            {message && <p>{message}</p>}
            <div className="wallet-modal-actions">
              <button type="submit" className="wallet-submit-btn" disabled={loading || withdrawStopped}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
