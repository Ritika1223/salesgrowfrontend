import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../../../config/api";
import { authJsonHeaders, getToken } from "../../../utils/auth";

export default function WithdrawRequest() {
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!getToken()) {
      setError("Please login first");
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
    } catch (err) {
      setError(err?.response?.data?.message || "Could not submit withdrawal");
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
          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                className="wallet-input"
                placeholder="Minimum $5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>USDT Address</label>
              <input
                type="text"
                className="wallet-input"
                placeholder="name@upi"
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
              <button type="submit" className="wallet-submit-btn" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
