import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Success() {

  const location = useLocation();
  const navigate = useNavigate();

  const user = location.state || {};

  return (

<div className="app-register-screen">

  {/* HEADER */}
  <div className="app-register-header">

    <div className="header-glow"></div>

    <div className="brand-logo">
      <strong>MLM Project</strong>
    </div>

    <h2>Account Created Successfully</h2>

    <p>
      Welcome to MLM Project. Your account is now ready to use.
    </p>

  </div>

  {/* CARD */}
  <div className="app-register-card text-center">

    {/* Success Icon */}
    <div className="success-icon">

      <div className="success-check">
        <i className="bi bi-check-lg"></i>
      </div>

    </div>

    <h3 className="success-title">
      Registration Successful
    </h3>

    <p className="success-desc">
      Thank you for joining MLM Project. Your account has been created successfully.
      Below are your registration details.
    </p>

    {/* User Details */}
    <div className="user-details">

      <div className="detail-row">
        <span>
          <i className="bi bi-person"></i>
          Full Name
        </span>
        <strong>{user.name}</strong>
      </div>

      <div className="detail-row">
        <span>
          <i className="bi bi-person-badge"></i>
          Nick Name
        </span>
        <strong>{user.nickname}</strong>
      </div>

      <div className="detail-row">
        <span>
          <i className="bi bi-envelope"></i>
          Email
        </span>
        <strong>{user.email}</strong>
      </div>

      <div className="detail-row">
        <span>
          <i className="bi bi-telephone"></i>
          Phone
        </span>
        <strong>{user.phone}</strong>
      </div>

      {user.referralCode && (
        <div className="detail-row">
          <span>
            <i className="bi bi-gift"></i>
            Referral
          </span>
          <strong>{user.referralCode}</strong>
        </div>
      )}

    </div>

    <button
      className="success-btn"
      onClick={() => navigate("/login")}
    >
      Continue To Login
      <i className="bi bi-arrow-right ms-2"></i>
    </button>

  </div>

</div>



  );
}