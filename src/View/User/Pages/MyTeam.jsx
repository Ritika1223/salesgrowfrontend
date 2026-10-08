import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_AUTH } from "../../../config/api";
import { authJsonHeaders } from "../../../utils/auth";

const TABS = [
  { id: "direct", label: "Direct" },
  { id: 1, label: "Level 1" },
  { id: 2, label: "Level 2" },
  { id: 3, label: "Level 3" },
  { id: 4, label: "Level 4" },
  { id: 5, label: "Level 5" },
  { id: 6, label: "Level 6" },
];

export default function MyTeam() {
  const [levels, setLevels] = useState([]);
  const [tab, setTab] = useState("direct");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_AUTH}/team`, { headers: authJsonHeaders() })
      .then((res) => {
        if (!cancelled) setLevels(res.data?.levels || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Could not load team");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const levelNumber = tab === "direct" ? 1 : tab;
  const members = levels.find((row) => row.level === levelNumber)?.members || [];

  return (
    <div className="income-history-page">
      <div className="container-fluid">
        <div className="prox-live-navbar">
          <div className="prox-live-navbar-left">
            <div className="prox-live-logo">
              <i className="bi bi-people-fill"></i>
            </div>
            <div>
              <h2 className="prox-live-navbar-title">My Team</h2>
              <p className="prox-live-navbar-subtitle">
                Direct members and downline from level 1 to level 6
              </p>
            </div>
          </div>
        </div>

        <div className="income-history-card">
          <div className="income-history-filter-area" style={{ flexWrap: "wrap", gap: 8 }}>
            {TABS.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`prox-live-outline-btn ${tab === item.id ? "active" : ""}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
                {" "}
                ({(item.id === "direct" ? levels[0]?.members : levels.find((row) => row.level === item.id)?.members)?.length || 0})
              </button>
            ))}
          </div>

          {tab === "direct" || tab === 1 ? (
            <p className="prox-live-navbar-subtitle" style={{ margin: "12px 0" }}>
              Level 1 is your direct team.
            </p>
          ) : null}

          {loading && <p>Loading team...</p>}
          {error && <div className="app-alert error-alert">{error}</div>}

          {!loading && !error && (
            <div className="income-history-table-wrap">
              <table className="income-history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Referral Code</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length > 0 ? (
                    members.map((member, index) => (
                      <tr key={member.id}>
                        <td>{index + 1}</td>
                        <td>{member.name || member.nickname || "-"}</td>
                        <td>{member.phone || "-"}</td>
                        <td>{member.referralCode || "-"}</td>
                        <td>{member.plan || "-"}</td>
                        <td>{member.isActive ? "Active" : "Inactive"}</td>
                        <td>
                          {member.joinedAt
                            ? new Date(member.joinedAt).toLocaleDateString("en-IN")
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center" }}>
                        No members on this level
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
