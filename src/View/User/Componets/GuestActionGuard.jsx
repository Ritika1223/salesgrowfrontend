import React, { useState } from "react";
import { isGuest } from "../../../utils/auth";
import AuthPromptModal from "./AuthPromptModal";

const LOCK_SELECTOR =
  "button, a, input, select, textarea, label, [role='button']";

export default function GuestActionGuard({ children }) {
  const guest = isGuest();
  const [open, setOpen] = useState(false);

  const blockIfGuest = (e) => {
    if (!guest) return;
    if (e.target.closest("[data-guest-lock]")) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
      return;
    }
    if (e.target.closest("[data-guest-ok], .cp-auth-modal, .cp-auth-modal-backdrop")) return;
    const hit = e.target.closest(LOCK_SELECTOR);
    if (!hit) return;
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  if (!guest) return children;

  return (
    <div
      className="cp-guest-guard"
      onClickCapture={blockIfGuest}
      onSubmitCapture={blockIfGuest}
    >
      {children}
      <AuthPromptModal
        open={open}
        onClose={() => setOpen(false)}
        title="Login or register to use this"
        message="You can look around as a guest. Sign in or create an account to use features like Add Funds, chat, profile edits, and more."
      />
    </div>
  );
}
