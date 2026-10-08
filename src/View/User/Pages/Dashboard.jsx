import React, { useEffect, useMemo, useState } from "react";
import { API_AUTH, API_BASE } from "../../../config/api";

import axios from "axios";
import { resolveAuthUserId, authJsonHeaders } from "../../../utils/auth";
import { PlanDpRing, PlanCrownWithPrice } from "../Componets/PlanCrown";

function isOkFlag(payload) {
  return Boolean(payload && (payload.success === true || payload.sucess === true));
}

function sumIncomeReport(data) {
  if (!data) return 0;
  const keys = [
    "SelfIncome",
    "DirectIncome",
    "LevelIncome",
    "PoolIncome",
    "RankIncome",
  ];
  return keys.reduce(
    (sum, k) => sum + Number(data[k] ?? 0),
    0
  );
}

function formatMoneyINR(n) {
  const v = Number(n);
  if (Number.isNaN(v)) return "0";
  return v.toLocaleString("en-IN");
}

function titleCasePoolRank(rank) {
  if (!rank || typeof rank !== "string") return "Pool";
  const lower = rank.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function avatarUrlForName(name) {
  return name
  // const n = (name || "User").trim() || "User";
  // return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&size=128&background=random&color=fff`;
}

function leaderRanksLine(m) {
  if (!m) return "—";
  const parts = [m.poolRank, m.bonusRank].filter(
    (x) =>
      x != null &&
      String(x).trim() !== "" &&
      String(x).toUpperCase() !== "NONE"
  );
  return parts.length ? parts.join(" · ") : "—";
}

// --- Helper for displaying time ago ---
function timeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function activityIcon(type) {
  switch (type) {
    case "REFERRAL_BONUS":
      return <div className="timeline-icon green"><i className="bi bi-wallet2" /></div>;
    case "LEVEL_COMPLETE":
      return <div className="timeline-icon blue"><i className="bi bi-stars" /></div>;
    case "WITHDRAWAL":
      return <div className="timeline-icon orange"><i className="bi bi-cash-stack" /></div>;
    case "VIP_UNLOCK":
      return <div className="timeline-icon pink"><i className="bi bi-gem" /></div>;
    default:
      return <div className="timeline-icon"><i className="bi bi-activity" /></div>;
  }
}

function activitySummary(item) {
  switch (item.type) {
    case "REFERRAL_BONUS":
      return `Referral bonus earned`;
    case "LEVEL_COMPLETE":
      return `Completed a Level`;
    case "WITHDRAWAL":
      return `Withdrawal processed`;
    case "VIP_UNLOCK":
      return `Unlocked VIP Club`;
    default:
      // fallback use description if possible
      return item.description || "Activity";
  }
}

function activityValue(item) {
  switch (item.type) {
    case "REFERRAL_BONUS":
      return <div className="timeline-value green-text">{item.amount ? `+${formatMoneyINR(item.amount)}` : "+0"}</div>;
    case "BUY_COIN":
      return <div className="timeline-value green-text">{item.amount ? `+${formatMoneyINR(item.amount)}` : "+0"}</div>;
    case "TOPUP":
      return <div className="timeline-value green-text">{item.amount ? `+${formatMoneyINR(item.amount)}` : "+0"}</div>;
    case "CHAT_SPEND":
      return <div className="timeline-value green-text">{item.amount ? `-${formatMoneyINR(item.amount)}` : "+0"}</div>;
    case "CHAT_EARN":
      return <div className="timeline-value green-text">{item.amount ? `+${formatMoneyINR(item.amount)}` : "+0"}</div>;
    case "LIVE_TIP":
      return <div className="timeline-value green-text">{item.amount ? `+${formatMoneyINR(item.amount)}` : "+0"}</div>;
    case "LEVEL_COMPLETE":
      return <div className="timeline-value blue-text">Level Up</div>;
    case "WITHDRAWAL":
      return <div className="timeline-value orange-text">{item.amount ? `-${formatMoneyINR(item.amount)}` : "-0"}</div>;
    case "VIP_UNLOCK":
      return <div className="timeline-value pink-text">VIP</div>;
    default:
      return null;
  }
}

export default function Dashboard() {
  const [incomeReport, setIncomeReport] = useState(null);
  const [profile, setProfile] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [poolReport, setPoolReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [userId] = useState(resolveAuthUserId());
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const totalEarned = useMemo(
    () => sumIncomeReport(incomeReport),
    [incomeReport]
  );

  const poolRows = poolReport?.poolData;
  const poolProgressPct = useMemo(() => {
    const rows = Array.isArray(poolRows) ? poolRows : [];
    const cap = Number(poolReport?.totalPools) || 6;
    if (!cap) return 0;
    return Math.min(100, Math.round((rows.length / cap) * 100));
  }, [poolRows, poolReport?.totalPools]);

  const topThree = useMemo(() => {
    const sorted = [...leaders].sort(
      (a, b) =>
        Number(a.rankPosition || 0) - Number(b.rankPosition || 0)
    );
    const a = sorted[0];
    const b = sorted[1];
    const c = sorted[2];
    return { first: a, second: b, third: c, rest: sorted.slice(3) };
  }, [leaders]);

  const podiumMax = useMemo(() => {
    return Math.max(
      1,
      Number(topThree.first?.totalEarning || 0),
      Number(topThree.second?.totalEarning || 0),
      Number(topThree.third?.totalEarning || 0)
    );
  }, [
    topThree.first,
    topThree.second,
    topThree.third,
  ]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setErr(null);
    }

    const token = localStorage.getItem("token") || "";
    const authHeaders = {
      ...authJsonHeaders(),
    };

    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setErr(null);

      const [incRes, profRes, topsRes, poolRes] =
        await Promise.allSettled([
          userId
            ? axios.get(`${API_BASE}/plans/getIncomeReport`, {
                headers: authHeaders,
              })
            : Promise.reject(new Error("guest")),
          userId
            ? axios.get(`${API_AUTH}/user/me`, {
                headers: authHeaders,
              })
            : Promise.reject(new Error("guest")),
          axios.get(`${API_BASE}/plans/top-leaders`),
          userId
            ? axios.get(`${API_BASE}/plans/getPoolReport`)
            : Promise.reject(new Error("guest")),
        ]);

      if (cancelled) return;

      if (incRes.status === "fulfilled") {
        const d = incRes.value.data;
        if (isOkFlag(d) && d.data) {
          setIncomeReport(d.data);
        } else {
          setIncomeReport(null);
          if (userId) setErr("Failed to load income report");
        }
      } else if (userId) {
        setIncomeReport(null);
        setErr("Failed to load income report");
      } else {
        setIncomeReport(null);
      }

      if (profRes.status === "fulfilled") {
        setProfile(profRes.value.data?.user || null);
      } else {
        setProfile(null);
      }

      if (topsRes.status === "fulfilled") {
        const d = topsRes.value.data;
        if (d?.success && Array.isArray(d.data)) {
          setLeaders(d.data);
        } else {
          setLeaders([]);
        }
      } else {
        setLeaders([]);
      }

      if (poolRes.status === "fulfilled") {
        const d = poolRes.value.data;
        if (isOkFlag(d) && d.data) {
          setPoolReport(d.data);
        } else {
          setPoolReport(null);
        }
      } else {
        setPoolReport(null);
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Fetch activity feed
  useEffect(() => {
    let cancelled = false;
    async function fetchActivity() {
      setActivityLoading(true);
      try {
        // Retrieve token from local storage
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/activity`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        const d = res.data;
        if (!cancelled && d?.success && Array.isArray(d.data)) {
          setActivity(d.data);
        }
      } catch (e) {
        if (!cancelled) setActivity([]);
      } finally {
        if (!cancelled) setActivityLoading(false);
      }
    }
    fetchActivity();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>

      <div className="container-fluid">
        <div className="topbar">


          {/* LEFT */}
          <div className="user-welcome">

            <PlanDpRing
              plan={profile?.plan}
              className="avatar"
              overlay={<span className="online-status"></span>}
            >
              {profile?.profilePhoto ? (
                <img src={profile.profilePhoto} alt="" />
              ) : (
                (profile?.name?.[0] || "U").toUpperCase()
              )}
            </PlanDpRing>

            <div className="hello">

              <strong className="welcome-title">
                Hello, {profile?.name?.trim() || "there"} 👋
              </strong>

              <span className="welcome-subtitle">
                Welcome back! Let’s complete your next task and earn more.
              </span>

            </div>

          </div>

          {/* RIGHT */}
          <div className="top-actions">

            <div className="icon-pill" title="Notifications">

              <span className="top-icon">
                🔔
              </span>

              <div className="badge">
                3
              </div>

            </div>

            <div className="icon-pill" title="Support">

              <span className="top-icon">
                🎧
              </span>

            </div>

          </div>
        </div>


        <div className="stats">
          {loading ? (
            <div style={{ color: "#fff", padding: 20 }}>Loading...</div>
          ) : err ? (
            <div style={{ color: "#ff4d4d", padding: 20 }}>{err}</div>
          ) : (
            <>
              {/* Self Income */}
              <div className="stat stat-green">
                <div className="row">
                  <div className="left">
                    <div className="chip chip-green">
                      <i className="bi bi-cash-stack"></i>
                    </div>

                    <div>
                      <h3>Self Income</h3>
                      <p className="stat-amount">
                        
                        {incomeReport?.SelfIncome ?? 0}
                      </p>
                      <p className="stat-text">
                        All time earnings
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Income */}
              <div className="stat stat-blue">
                <div className="row">
                  <div className="left">
                    <div className="chip chip-blue">
                      <i className="bi bi-people-fill"></i>
                    </div>

                    <div>
                      <h3>Direct Income</h3>
                      <p className="stat-amount">
                         {incomeReport?.DirectIncome ?? 0}
                      </p>
                      <p className="stat-text">
                        Referral bonus earned
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level Income */}
              <div className="stat stat-purple">
                <div className="row">
                  <div className="left">
                    <div className="chip chip-purple">
                      <i className="bi bi-bar-chart-fill"></i>
                    </div>

                    <div>
                      <h3>Level Income</h3>
                      <p className="stat-amount">
                         {formatMoneyINR(incomeReport?.LevelIncome ?? 0)}
                      </p>
                      <p className="stat-text">
                        Team level rewards
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pool Income */}
              <div className="stat stat-orange">
                <div className="row">
                  <div className="left">
                    <div className="chip chip-orange">
                      <i className="bi bi-trophy-fill"></i>
                    </div>

                    <div>
                      <h3>Pool Income</h3>
                      <p className="stat-amount">
                        {incomeReport?.PoolIncome ?? 0}
                      </p>
                      <p className="stat-text">
                        Pool bonus income
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rank Income */}
              <div className="stat stat-pink">
                <div className="row">
                  <div className="left">
                    <div className="chip chip-pink">
                      <i className="bi bi-gem"></i>
                    </div>

                    <div>
                      <h3>Rank Income</h3>
                      <p className="stat-amount">
                        {incomeReport?.RankIncome ?? 0}
                      </p>
                      <p className="stat-text">
                        Rank achievement bonus
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* VIP Club */}
              <div className="stat stat-brown">
                <div className="row">
                  <div className="left">
                    <div className="chip chip-brown">
                      <i className="bi bi-stars"></i>
                    </div>

                    <div>
                      <h3>VIP Club</h3>
                      <p className="stat-amount"> 00</p>
                      <p className="stat-text">
                        Complete tasks to unlock
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Earned */}
              <div className="stat stat-cyan">
                <div className="row">
                  <div className="left">
                    <div className="chip chip-cyan">
                      <i className="bi bi-wallet2"></i>
                    </div>

                    <div>
                      <h3>Total Earned</h3>
                      <p className="stat-amount">
                         {formatMoneyINR(totalEarned)}
                      </p>
                      <p className="stat-text">
                        Sum of income categories
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Withdrawable */}
              <div className="stat stat-red">
                <div className="row">
                  <div className="left">
                    <div className="chip chip-red">
                      <i className="bi bi-bank"></i>
                    </div>

                    <div>
                      <h3>Withdrawable</h3>
                      <p className="stat-amount"> 00</p>
                      <p className="stat-text">
                        Completed Withdrawal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="dash-section">

       

          {/* NEXT ACTION */}
          <div className="next-card">

            <div className="next-left">

              <div className="next-icon">
                ➕
              </div>

              <div className="next-text">

                <span className="next-label">
                  NEXT ACTION
                </span>

                <h3 className="next-title">
                  Complete 1 Referral
                </h3>

                <p className="next-desc">
                  Invite a friend to join and unlock
                  <b className="highlight-amount"> 75</b>
                </p>

              </div>

            </div>

            <button className="ghost-btn">
              Invite Now →
            </button>

          </div>

          <div className="row g-4">

            {/* LEFT SIDE */}
            <div className="col-lg-12">

              {/* POOLS */}
              {/* <div className="cpx-ultra-box">

                <div className="cpx-box-head">

                  <div>
                    <h2>Pools progression</h2>
                    <p>Grow directs & unlock pools</p>

                  </div>

                </div>

                <div className="cpx-pool-wrap">

                  {Array.isArray(poolRows) && poolRows.length ? (
                    poolRows.map((p, idx) => {
                      // Map direct directs required to pool index: 10,20,50,100,200,500
                      const directsRequiredArr = [10, 20, 50, 100, 200, 500];
                      // Fix for pools - cycle through requirement array or clamp to max
                      const directsRequired = directsRequiredArr[
                        idx < directsRequiredArr.length
                          ? idx
                          : directsRequiredArr.length - 1
                      ];
                      return (
                        <div
                          className="cpx-pool-card"
                          key={`${p.level}-${p.rank}-${p.date}`}
                        >
                          <div>
                            <h4>
                              {titleCasePoolRank(p.rank)} pool
                            </h4>
                            <p>{directsRequired} Directs Required</p>
                          </div>
                          <span>
                            {formatMoneyINR(p.amount)} {""}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        color: "#fff",
                        padding: 16,
                        opacity: 0.85,
                      }}
                    >
                      No pool data loaded yet.
                    </div>
                  )}



                </div>

              </div> */}

            </div>

          </div>

          <div className="dashboard-bottom-grid">
            {/* LEADERBOARD */}
            <div className="neo-card leaderboard-ui">
              <div className="neo-card-bg" />
              <div className="neo-head">
                <div>
                  <span className="neo-tag">Leaderboard</span>
                  <h2>Top Champions</h2>
                </div>
                <button className="neo-btn">
                  <i className="bi bi-trophy-fill" />
                </button>
              </div>
              {/* TOP USERS */}
              <div className="champions-grid">
                <div className="champion-card silver">
                  {topThree.second ? (
                    <>
                      <div className="champion-rank">
                        {topThree.second.rankPosition}
                      </div>
                      <div className="champion-avatar">
                        <img
                          src={topThree.second.photo || "/images/user.jpg"}
                          alt="User"
                          onError={(e) => {
                            e.target.src = "/images/user.jpg";
                          }}
                        />
                      </div>
                      <h4>{topThree.second.name}</h4>
                      <p>

                        <img src="/images/icon2.png" className="w-30" /> {formatMoneyINR(
                          topThree.second.totalEarning
                        )}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          opacity: 0.8,
                          marginTop: -6,
                        }}
                      >
                        {leaderRanksLine(topThree.second)}
                      </p>
                      <div className="champion-bar">
                        <div
                          style={{
                            width: `${Math.min(
                              100,
                              (Number(
                                topThree.second
                                  .totalEarning || 0
                              ) /
                                podiumMax) *
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <p style={{ opacity: 0.65 }}>—</p>
                  )}
                </div>
                <div className="champion-card gold active">
                  {topThree.first ? (
                    <>
                      <div className="crown">
                        <i className="bi bi-award-fill" />
                      </div>
                      <div className="champion-rank">
                        {topThree.first.rankPosition}
                      </div>
                      <div className="champion-avatar">
                        <img
                          src={topThree.first.photo || "/images/user.jpg"}
                          alt="User"
                          onError={(e) => {
                            e.target.src = "/images/user.jpg";
                          }}
                        />

                      </div>
                      <h4>{topThree.first.name}</h4>
                      <p>
                        <img src="/images/icon2.png" className="w-30" /> {formatMoneyINR(
                          topThree.first.totalEarning
                        )}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          opacity: 0.8,
                          marginTop: -6,
                        }}
                      >
                        {leaderRanksLine(topThree.first)}
                      </p>
                      <div className="champion-bar">
                        <div
                          style={{
                            width: `${Math.min(
                              100,
                              (Number(
                                topThree.first
                                  .totalEarning || 0
                              ) /
                                podiumMax) *
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <p style={{ opacity: 0.65 }}>—</p>
                  )}
                </div>
                <div className="champion-card bronze">
                  {topThree.third ? (
                    <>
                      <div className="champion-rank">
                        {topThree.third.rankPosition}
                      </div>
                      <div className="champion-avatar">
                        <img
                          src={topThree.third.photo || "/images/user.jpg"}
                          alt="User"
                          onError={(e) => {
                            e.target.src = "/images/user.jpg";
                          }}
                        />

                      </div>
                      <h4>{topThree.third.name}</h4>
                      <p>
                        <img src="/images/icon2.png" className="w-30" /> {formatMoneyINR(
                          topThree.third.totalEarning
                        )}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          opacity: 0.8,
                          marginTop: -6,
                        }}
                      >
                        {leaderRanksLine(topThree.third)}
                      </p>
                      <div className="champion-bar">
                        <div
                          style={{
                            width: `${Math.min(
                              100,
                              (Number(
                                topThree.third
                                  .totalEarning || 0
                              ) /
                                podiumMax) *
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <p style={{ opacity: 0.65 }}>—</p>
                  )}
                </div>
              </div>
              {/* USER LIST */}
              <div className="ranking-list">
                {topThree.rest.length ? (
                  topThree.rest.map((row) => (
                    <div
                      className="rank-item"
                      key={`${row.rankPosition}-${row.name}`}
                    >
                      <div className="rank-left">
                        <div className="rank-number">
                          {row.rankPosition}
                        </div>
                        <div className="rank-avatar">
                          <img
                            src={avatarUrlForName(row.name) || "/images/user.jpg"}
                            alt={row.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/user.jpg";
                            }}
                          />

                        </div>
                        <div className="rank-user">
                          <strong>{row.name}</strong>
                          <span>{leaderRanksLine(row)}</span>
                        </div>
                      </div>
                      <div className="rank-score">
                        <img src="/images/icon2.png" className="w-30" /> {formatMoneyINR(row.totalEarning)}{" "}
                        <small>earn</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="rank-item"
                    style={{ opacity: 0.75 }}
                  >
                    <div className="rank-left">
                      <div className="rank-user">
                        <span>
                          {leaders.length
                            ? "End of top leaderboard."
                            : "No leaderboard data yet."}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* RECENT ACTIVITY */}
            <div className="neo-card activity-ui">
              <div className="neo-card-bg purple" />
              <div className="neo-head">
                <div>
                  <span className="neo-tag purple-tag">Live Feed</span>
                  <h2>Recent Activity</h2>
                </div>
              </div>
              <div className="timeline">
                {activityLoading ? (
                  <div style={{ color: "#fff", padding: 16, opacity: 0.75 }}>
                    Loading activity...
                  </div>
                ) : activity && activity.length ? (
                  activity.slice(0, 7).map((item, idx) => (

                    <div className="timeline-item" key={item.date + idx}>
                      {activityIcon(item.type)}
                      <div className="timeline-content">
                        <h5>
                          {activitySummary(item)}
                          {item.amount != null && item.type === "REFERRAL_BONUS" ? (<> (+{formatMoneyINR(item.amount)})</>) : (<> (+{formatMoneyINR(item.amount)})</>)}
                        </h5>
                        <p>{timeAgo(item.date)}</p>
                      </div>
                      {activityValue(item)}
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#fff", padding: 16, opacity: 0.75 }}>
                    No activity found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
