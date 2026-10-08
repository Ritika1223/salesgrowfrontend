import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_CHAT } from "../../../config/api";
import { isLoggedIn, isGuest } from "../../../utils/auth";

const FLOATING = [
  { name: "Rohan", mins: "3m", flag: "🇮🇳", pos: "intro-float--tl" },
  { name: "Sofia", mins: "3m", flag: "✨", pos: "intro-float--tr" },
  { name: "Neha", mins: "5m", flag: "🇮🇳", pos: "intro-float--bl" },
  { name: "Arjun", mins: "4m", flag: "🇮🇳", pos: "intro-float--br" },
];

function formatCount(n) {
  return Number(n || 0).toLocaleString("en-IN");
}

export default function IntroLanding() {
  const navigate = useNavigate();
  const [liveCount, setLiveCount] = useState(0);
  const [matchingNow, setMatchingNow] = useState(12840);

  useEffect(() => {
    if (isLoggedIn() || isGuest()) {
      navigate("/live", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_CHAT}/live/active`)
      .then((res) => {
        if (cancelled) return;
        const sessions = res.data?.sessions || [];
        const users = sessions.reduce((sum, s) => {
          const c =
            typeof s.participantCount === "number"
              ? s.participantCount
              : Array.isArray(s.participantIds)
                ? s.participantIds.length
                : 1;
          return sum + c;
        }, 0);
        setLiveCount(sessions.length);
        setMatchingNow(Math.max(users, sessions.length, 1) * 17 + 12823);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="intro-landing">
      <div className="intro-landing-glow intro-landing-glow--a"></div>
      <div className="intro-landing-glow intro-landing-glow--b"></div>

      <header className="intro-topbar">
        <div className="intro-brand">
          <strong>MLM Project</strong>
        </div>
        <div className="intro-live-now">
          <span className="intro-live-dot"></span>
          Live Now
          <strong>{formatCount(liveCount || matchingNow)}</strong>
        </div>
      </header>

      <main className="intro-hero">
        <div className="intro-orbit">
          {FLOATING.map((person) => (
            <div key={person.name} className={`intro-float ${person.pos}`}>
              <div className="intro-float-avatar">
                <img src="/images/avtar.png" alt="" />
              </div>
              <div className="intro-float-meta">
                <strong>
                  {person.name} <span>{person.flag}</span>
                </strong>
                <span>{person.mins}</span>
              </div>
            </div>
          ))}

          <div className="intro-hero-photo">
            <img src="/images/avtar.png" alt="Live chat" />
            <span className="intro-heart">
              <i className="bi bi-heart-fill"></i>
            </span>
          </div>
        </div>

        <h1>
          Meet new people
          <br />
          <span>&amp; make real connections</span>
          <br />
          via Live Chat
        </h1>
        <p className="intro-sub">
          Real people. Random matches, just start talking.
        </p>

        <div className="intro-matching">
          <span className="intro-matching-dot"></span>
          <strong>{formatCount(matchingNow)}</strong>
          <span>Users are Matching Now.</span>
        </div>

        <button
          type="button"
          className="intro-guest-btn"
          onClick={() => navigate("/guest")}
        >
          <i className="bi bi-person-fill"></i>
          Start as a Guest
        </button>

        <div className="intro-auth-links">
          <Link to="/login">Sign in</Link>
          <span>·</span>
          <Link to="/signup">Create account</Link>
        </div>
      </main>
    </div>
  );
}
