import React, { useState } from "react";

export default function Support() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // For now, just simulate submission
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <>
      <div className="topbar cp-mb-36">
        <div className="user-welcome cp-page-title">
          <span role="img" aria-label="support" className="cp-mr-10">
            💬
          </span>
          Support & Help
        </div>
      </div>
      <div
        className="cp-support-card"
      >
        <h2 className="cp-support-title">
          Need <span className="cp-accent-gold">Help?</span>
        </h2>
        <p className="cp-support-subtitle">
          Our team is here to assist you with any queries or issues!
        </p>

        {submitted ? (
          <div
            className="cp-support-submitted"
          >
            <span role="img" aria-label="check" className="cp-support-check">
              ✅
            </span>
            <div className="cp-support-submitted-text">Your message has been sent! <br /> We'll get back to you soon.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="cp-support-form">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="cp-support-input"
              required
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="cp-support-input"
              required
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help you?"
              className="cp-support-textarea"
              required
            />
            <button
              type="submit"
              className="btn"
              className="cp-support-submit"
            >
              Send Message
            </button>
          </form>
        )}

        <div className="cp-support-footer">
          <div>
            <span className="cp-support-footer-label">Email:</span>{" "}
            <a
              href="mailto:support@goshivx.com"
              className="cp-support-footer-link"
            >
              support@goshivx.com
            </a>
          </div>
          <div className="cp-support-footer-quick">
            <span className="cp-support-footer-label">Need quick help?</span> <br />
            <a
              href="https://t.me/goshivxsupport"
              target="_blank"
              rel="noopener noreferrer"
              className="cp-support-footer-telegram"
            >
              Chat on Telegram &rarr;
            </a>
          </div>
        </div>
      </div>
    </>
  );
}