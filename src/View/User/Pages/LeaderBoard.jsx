import React, { useState, useEffect } from "react";

const mockLeaderboardData = [
  {
    id: 1,
    name: "Vishesh ...",
    avatar: "🦸‍♂️",
    points: 2425,
  },
  {
    id: 2,
    name: "Anil Kumar",
    avatar: "👩‍💻",
    points: 2310,
  },
  {
    id: 3,
    name: "Jai Chand",
    avatar: "🧑‍🚀",
    points: 2187,
  },
  {
    id: 4,
    name: "Vaibhav Yadav",
    avatar: "👩‍🔬",
    points: 2111,
  },
  {
    id: 5,
    name: "Rajan Kumar",
    avatar: "👨‍🎨",
    points: 1998,
  },
  {
    id: 6,
    name: "Pranshu Verman ",
    avatar: "👨‍💼",
    points: 1889,
  },
  {
    id: 7,
    name: "Preeti Kumari",
    avatar: "👩‍🚒",
    points: 1777,
  },
  {
    id: 8,
    name: "Bhavna Sharma",
    avatar: "🧑‍💻",
    points: 1644,
  },
  {
    id: 9,
    name: "Jagdish Chandr Bhatt",
    avatar: "👩‍🎤",
    points: 1520,
  },
  {
    id: 10,
    name: "Kundan Kumar",
    avatar: "👨‍🔧",
    points: 1455,
  },
];

export default function LeaderBoard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    setLeaders(mockLeaderboardData);
  }, []);

  return (
    <>
      <div className="topbar cp-mb-36">
        <div
          className="user-welcome"
          className="user-welcome cp-page-title cp-page-title--row"
        >
          <span role="img" aria-label="leaderboard" className="cp-mr-10">
            🏆
          </span>
          Leaderboard
        </div>
      </div>
      <div
        className="cp-leaderboard-card"
      >
        <h2 className="cp-leaderboard-title">
          Top <span className="cp-accent-gold">Performers</span>
        </h2>
        <p className="cp-leaderboard-subtitle">
          Compete, climb and become the best. See where you stand!
        </p>
        <div className="cp-leaderboard-top3">
          {leaders.slice(0, 3).map((user, idx) => (
            <div
              key={user.id}
              className={`cp-leaderboard-top-item cp-leaderboard-top-item--${idx + 1}`}
            >
              <span className="cp-leaderboard-avatar-lg">
                {user.avatar}
              </span>
              <span className="cp-flex-1">{user.name}</span>
              <span
                className="cp-leaderboard-top-points"
              >
                {user.points} pts
              </span>
              <span
                className="cp-leaderboard-medal"
                title={
                  idx === 0
                    ? "1st Place"
                    : idx === 1
                    ? "2nd Place"
                    : "3rd Place"
                }
                aria-label={
                  idx === 0
                    ? "gold medal"
                    : idx === 1
                    ? "silver medal"
                    : "bronze medal"
                }
              >
                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
              </span>
            </div>
          ))}
        </div>
        <div>
          {leaders.slice(3).map((user, idx) => (
            <div
              key={user.id}
              className="cp-leaderboard-row"
            >
              <span className="cp-leaderboard-rank">
                {idx + 4}
              </span>
              <span className="cp-leaderboard-avatar-sm">
                {user.avatar}
              </span>
              <span className="cp-flex-1">{user.name}</span>
              <span
                className="cp-leaderboard-points"
              >
                {user.points} pts
              </span>
            </div>
          ))}
        </div>
        <div
          className="cp-leaderboard-footer"
        >
          Want to be #1? <span className="cp-accent-gold">Complete more tasks!</span>
        </div>
      </div>
    </>
  );
}