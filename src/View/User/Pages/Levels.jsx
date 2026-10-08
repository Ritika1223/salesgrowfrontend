import React from "react";

const levels = [
  {
    id: 1,
    title: "Bronze",
    subtitle: "Getting Started",
    reward: "₹10 bonus",
    requirement: "Just sign up!",
    emoji: "🥉",
    bg: "linear-gradient(115deg,#54422c 0,#cfac68 100%)",
    color: "#fbbf24",
    progress: 100,
  },
  {
    id: 2,
    title: "Silver",
    subtitle: "Rising Star",
    reward: "₹25 bonus",
    requirement: "Complete your first 3 tasks",
    emoji: "🥈",
    bg: "linear-gradient(115deg,#a5a5c7 0,#e0e2ea 100%)",
    color: "#a3e635",
    progress: 70,
  },
  {
    id: 3,
    title: "Gold",
    subtitle: "Champion",
    reward: "₹50 bonus",
    requirement: "Refer 2 friends",
    emoji: "🥇",
    bg: "linear-gradient(115deg,#ecd86a 0, #fded86 100%)",
    color: "#ffd700",
    progress: 35,
  },
  {
    id: 4,
    title: "Platinum",
    subtitle: "Legend",
    reward: "₹100 bonus",
    requirement: "Earn ₹500 total",
    emoji: "🏆",
    bg: "linear-gradient(115deg,#82caff 0, #4c51bf 100%)",
    color: "#60a5fa",
    progress: 10,
  },
];

export default function Levels() {
  return (
    <>
      <div className="topbar cp-mb-36">
        <div className="user-welcome cp-page-title">
          <span role="img" aria-label="trophy" className="cp-mr-10">
            🏆
          </span>
          My Levels & Rewards
        </div>
      </div>
      <div
        className="cp-levels-card"
      >
        <h2 className="cp-levels-title">
          Level Up <span className="cp-accent-gold">Your Journey</span>
        </h2>
        <p className="cp-levels-subtitle">
          Complete tasks, invite friends & unlock rewards as you rise through the Levels!
        </p>
        <div className="cp-levels-list">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`cp-level-item cp-level-item--${level.id}`}
            >
              <div
                className={`cp-level-emoji cp-level-emoji--${level.id}`}
                aria-label="level-emoji"
              >
                {level.emoji}
              </div>
              <div className="cp-flex-1">
                <div className="cp-level-head">
                  <strong className="cp-level-name">
                    {level.title}
                  </strong>
                  <span
                    className={`cp-level-pill cp-level-pill--${level.id}`}
                  >
                    {level.reward}
                  </span>
                </div>
                <div className="cp-level-subtitle">
                  {level.subtitle}
                </div>
                <div className="cp-level-requirement">
                  <span className="cp-fw-600">Requirement:</span> {level.requirement}
                </div>
                <div
                  className="cp-level-bar"
                >
                  <div
                    className={`cp-level-bar-fill cp-level-bar-fill--${level.id}`}
                  />
                </div>
                {level.progress === 100 && (
                  <span
                    className="cp-level-claimed"
                  >
                    🎉 Claimed!
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="cp-levels-footer">
          More levels and missions coming soon. Keep up the progress!
        </div>
      </div>
    </>
  );
}