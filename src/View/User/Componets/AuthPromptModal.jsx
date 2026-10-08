import React from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

export default function AuthPromptModal({
  open,
  onClose,
  title = "Create an account to continue",
  message = "You can browse ChatProX as a guest. Sign in or register to use this feature.",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!open) return null;

  const go = (path) => {
    navigate(path, { state: { from: location.pathname } });
  };

  return createPortal(
    <div className="cp-auth-modal-backdrop" role="dialog" aria-modal="true">
      <div className="cp-auth-modal">
        <button type="button" className="cp-auth-modal-close" onClick={onClose} aria-label="Close">
          <i className="bi bi-x-lg"></i>
        </button>
        <div className="cp-auth-modal-icon">
          <i className="bi bi-person-lock"></i>
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <button type="button" className="cp-auth-modal-primary" onClick={() => go("/signup")}>
          Register
          <i className="bi bi-arrow-right"></i>
        </button>
        <button type="button" className="cp-auth-modal-secondary" onClick={() => go("/login")}>
          Sign in
        </button>
        <button type="button" className="cp-auth-modal-ghost" onClick={onClose}>
          Keep browsing as guest
        </button>
      </div>
    </div>,
    document.body
  );
}
