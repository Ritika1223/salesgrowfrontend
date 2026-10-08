import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_AUTH } from "../../../config/api";
import { clearGuest, isLoggedIn } from "../../../utils/auth";

const loginUrl = `${API_AUTH}/login`;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          password: form.password,
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch(parseError) {
        setError('Unexpected response from server.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.message || 'Login failed!');
      } else {
        // Save the token to localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        const userFromApi =
          data.user ||
          data.data?.user ||
          data.profile ||
          (data._id || data.id ? { _id: data._id || data.id } : null);
        if (userFromApi) {
          try {
            localStorage.setItem("auth_user", JSON.stringify(userFromApi));
          } catch {
            // ignore storage errors
          }
        }
        clearGuest();
        setSuccess('Login successful!');
        const next = location.state?.from && location.state.from !== "/login"
          ? location.state.from
          : "/dashboard";
        navigate(next, { replace: true });
      }
    } catch (err) {
      setError('Cannot connect to API. Is it running? Network error: ' + err.message);
    }
    setLoading(false);
  };

  return (
<div className="sg-auth">
  <aside className="sg-auth-panel">
    <img src="/images/salesgrow.png" alt="SalesGrow" />
    <h1>SalesGrow</h1>
    <p>Sign in to manage subscriptions, referrals, and income from one place.</p>
  </aside>

  <main className="sg-auth-main">
  <div className="sg-auth-card">
    <h2>Sign in</h2>
    <p className="sg-lead">Use your phone number and password.</p>

    <form onSubmit={handleSubmit} className="app-login-form">

      {/* PHONE */}
      <div className="app-form-group">
        <label>Phone Number</label>

        <div className="app-input-box">
          <div className="input-icon">
            <i className="bi bi-phone"></i>
          </div>

          <input
            type="text"
            name="phone"
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>

{/* PASSWORD */}
<div className="app-form-group">

  <label>
    Password
  </label>

  <div className="app-input-box">

    <div className="input-icon">
      <i className="bi bi-lock"></i>
    </div>

    <input
      type={showPassword ? "text" : "password"}
      name="password"
      placeholder="Enter your password"
      value={form.password}
      onChange={handleChange}
      required
    />

    {/* EYE BUTTON */}
    <button
      type="button"
      className="app-password-toggle"
      onClick={() => setShowPassword(!showPassword)}
    >
      {
        showPassword ? (
          <i className="bi bi-eye-slash-fill"></i>
        ) : (
          <i className="bi bi-eye-fill"></i>
        )
      }
    </button>

  </div>

</div>

      {/* OPTIONS */}
      <div className="app-login-options">

        <label className="remember-check">
          <input type="checkbox" />
          <span>Remember Me</span>
        </label>

        <a href="/">
          Forgot Password?
        </a>

      </div>

      {/* ALERTS */}
      {error && (
        <div className="app-alert error-alert">
          {error}
        </div>
      )}

      {success && (
        <div className="app-alert success-alert">
          {success}
        </div>
      )}

      {/* BUTTON */}
      <button
        type="submit"
        className="app-login-btn"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm"></span>
            Logging in...
          </>
        ) : (
          <>
            Login Now
            <i className="bi bi-arrow-right"></i>
          </>
        )}
      </button>

    </form>

    <div className="signup-text">
      New here?
      <Link to="/signup"> Create an account</Link>
    </div>
  </div>
  </main>
</div>
  );
}
