import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_AUTH } from "../../../config/api";
import { authJsonHeaders } from "../../../utils/auth";

export default function AccountSecurity() {
  const { pathname } = useLocation();
  const isLogin = pathname.includes("login");
  const title = isLogin ? "Login Security" : "Transaction Security";
  const endpoint = isLogin
    ? `${API_AUTH}/user/login-password`
    : `${API_AUTH}/user/transaction-password`;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        endpoint,
        { oldPassword, newPassword, confirmPassword },
        { headers: authJsonHeaders() }
      );
      setMessage(res.data?.message || "Password updated");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update password");
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
              <i className={`bi ${isLogin ? "bi-shield-lock" : "bi-key"}`}></i>
            </div>
            <div>
              <h2 className="prox-live-navbar-title">{title}</h2>
              <p className="prox-live-navbar-subtitle">
                {isLogin
                  ? "Change the password used to sign in"
                  : "Set a transaction password. Until you do, it stays the same as your login password."}
              </p>
            </div>
          </div>
        </div>

        <div className="income-history-card fund-request-form">
          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Old Password</label>
              <input
                type="password"
                className="wallet-input"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="wallet-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="wallet-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="wallet-error">{error}</div>}
            {message && <p>{message}</p>}
            <div className="wallet-modal-actions">
              <button type="submit" className="wallet-submit-btn" disabled={loading}>
                {loading ? "Saving..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
