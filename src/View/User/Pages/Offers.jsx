import React from "react";
import { useNavigate } from "react-router-dom";

export default function Offers() {
  const navigate = useNavigate();

  // Example offers
  const offers = [
    {
      id: 1,
      emoji: "🎁",
      title: "Sign Up Bonus",
      description: "Get ₹50 instantly when you complete your first task after signing up!",
      highlight: "One time only",
      color: "#a3e635",
      bg: "linear-gradient(90deg,#312056 0,#3bb77e 100%)"
    },
    {
      id: 2,
      emoji: "💎",
      title: "Double Referral Rewards",
      description: "Earn double (₹100) when your friend completes their first task.",
      highlight: "Limited time",
      color: "#818cf8",
      bg: "linear-gradient(90deg,#312056 0,#6366f1 100%)"
    },
    {
      id: 3,
      emoji: "⚡",
      title: "Task Streak Bonus",
      description: "Finish tasks 7 days in a row to unlock a ₹150 reward!",
      highlight: "Active users only",
      color: "#fbbf24",
      bg: "linear-gradient(90deg,#312056 0,#f59e42 100%)"
    },
    {
      id: 4,
      emoji: "🏆",
      title: "Leaderboard Prizes",
      description: "Top 10 users of the week win exciting prizes & bonus coins.",
      highlight: "Every week",
      color: "#60a5fa",
      bg: "linear-gradient(90deg,#312056 0,#60a5fa 100%)"
    }
  ];

  return (
    <>
      <div className="topbar cp-mb-36">
        <div className="user-welcome">
          <div className="avatar">R</div>
          <div className="hello">
            <strong>Latest Offers 🎁</strong>
            <span>
              Unlock various rewards and make the most of your time on GoShivX!
            </span>
          </div>
        </div>
        <div className="top-actions">
          <div
            className="icon-pill"
            title="Back to Dashboard"
            onClick={() => navigate("/dashboard")}
            tabIndex={0}
            role="button"
            className="cp-cursor-pointer"
            aria-label="Back"
          >
            <span className="cp-icon-18">🏠</span>
          </div>
        </div>
      </div>

      <div
        className="cp-offers-card"
      >
        <h2 className="cp-offers-title">
          Unlock Your <span className="cp-accent-gold">Rewards</span>
        </h2>
        <p className="cp-offers-subtitle">
          Complete offers and level up your earnings!
        </p>

        <div className="cp-offers-list">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`cp-offer-item cp-offer-item--${offer.id}`}
            >
              <div
                className="cp-offer-emoji"
                aria-label="offer emoji"
              >
                {offer.emoji}
              </div>
              <div className="cp-offer-body">
                <div className="cp-offer-head">
                  <strong className="cp-offer-title">
                    {offer.title}
                  </strong>
                  <span
                    className={`cp-offer-pill cp-offer-pill--${offer.id}`}
                  >
                    {offer.highlight}
                  </span>
                </div>
                <p className="cp-offer-desc">
                  {offer.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}