import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { API_AUTH } from "../../../config/api";
import { authJsonHeaders } from "../../../utils/auth";

function buildTree(levels, rootId) {
  const byParent = new Map();
  (levels || []).forEach((row) => {
    (row.members || []).forEach((member) => {
      const node = {
        ...member,
        id: String(member.id),
        level: row.level,
        children: [],
      };
      const parentKey = String(member.referredBy || "");
      if (!byParent.has(parentKey)) byParent.set(parentKey, []);
      byParent.get(parentKey).push(node);
    });
  });

  const attach = (parentId) =>
    (byParent.get(String(parentId)) || []).map((node) => ({
      ...node,
      children: attach(node.id),
    }));

  return attach(rootId);
}

function formatJoined(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN");
}

function displayName(node) {
  return node?.nickname || node?.name || "Member";
}

function OrgNode({ node, parentName, depth, selectedId, onSelect }) {
  const name = displayName(node);
  const selected = selectedId === node.id;
  return (
    <li>
      <button
        type="button"
        className={`org-node depth-${Math.min(depth, 6)}${selected ? " is-selected" : ""}${node.isActive ? "" : " is-inactive"}`}
        onClick={() => onSelect(node, parentName)}
        title={name}
      >
        <span className="org-avatar" aria-hidden="true">
          <i className="bi bi-person-fill"></i>
        </span>
        <span className="org-name">{name}</span>
      </button>
      {node.children?.length ? (
        <ul>
          {node.children.map((child) => (
            <OrgNode
              key={child.id}
              node={child}
              parentName={name}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function TeamTree() {
  const [levels, setLevels] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_AUTH}/team`, { headers: authJsonHeaders() })
      .then((res) => {
        if (cancelled) return;
        setLevels(res.data?.levels || []);
        setMe(res.data?.me || null);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Could not load team tree");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const roots = useMemo(
    () => buildTree(levels, me?.id || ""),
    [levels, me?.id],
  );

  const myName = me?.nickname || me?.name || "You";
  const total = levels.reduce((sum, row) => sum + (row.members?.length || 0), 0);
  const hasParentLinks = levels.some((row) =>
    (row.members || []).some((member) => member.referredBy),
  );
  const chartChildren = hasParentLinks && roots.length > 0
    ? roots
    : (levels.find((row) => row.level === 1)?.members || []).map((member) => ({
      ...member,
      id: String(member.id),
      level: 1,
      children: [],
    }));

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
  }, [loading, total, hasParentLinks, roots]);

  const selectMember = (node, parentName) => {
    setSelected({ node, parentName });
  };

  return (
    <div className="income-history-page">
      <div className="container-fluid">
        <div className="prox-live-navbar">
          <div className="prox-live-navbar-left">
            <div className="prox-live-logo">
              <i className="bi bi-diagram-2-fill"></i>
            </div>
            <div>
              <h2 className="prox-live-navbar-title">Team Tree</h2>
              <p className="prox-live-navbar-subtitle">
                Your team, with each person joined under the member who referred them
              </p>
            </div>
          </div>
        </div>

        <div className="income-history-card org-chart-card">
          <div className="team-tree-summary">
            <span className="team-tree-chip">You · {myName}</span>
            <span className="team-tree-chip">{total} in team</span>
            {levels.map((row) => (
              <span key={row.level} className="team-tree-chip">
                Level {row.level}: {row.members?.length || 0}
              </span>
            ))}
          </div>

          {loading && <p>Loading team tree...</p>}
          {error && <div className="app-alert error-alert">{error}</div>}

          {!loading && !error && total === 0 && (
            <p className="team-tree-empty">No one has joined under you yet.</p>
          )}

          {!loading && !error && total > 0 && (
            <div className="org-chart-wrap">
              <div className="org-chart" ref={chartRef}>
                <ul>
                  <li>
                    <button
                      type="button"
                      className={`org-node depth-0${selected?.node?.id === "me" ? " is-selected" : ""}`}
                      onClick={() => selectMember({
                        id: "me",
                        name: myName,
                        level: 0,
                        referralCode: me?.referralCode || "",
                        isActive: true,
                      }, "")}
                    >
                      <span className="org-avatar" aria-hidden="true">
                        <i className="bi bi-person-fill"></i>
                      </span>
                      <span className="org-name">{myName}</span>
                    </button>
                    {chartChildren.length > 0 && (
                      <ul>
                        {chartChildren.map((node) => (
                          <OrgNode
                            key={node.id}
                            node={node}
                            parentName={myName}
                            depth={1}
                            selectedId={selected?.node?.id}
                            onSelect={selectMember}
                          />
                        ))}
                      </ul>
                    )}
                  </li>
                </ul>
              </div>

              {selected?.node && (
                <div className="org-detail">
                  <strong>{displayName(selected.node)}</strong>
                  <span>{selected.node.level ? `Level ${selected.node.level}` : "You"}</span>
                  {selected.parentName ? <span>Joined under {selected.parentName}</span> : null}
                  {selected.node.phone ? <span>{selected.node.phone}</span> : null}
                  {selected.node.referralCode ? <span>Code {selected.node.referralCode}</span> : null}
                  {selected.node.plan ? <span>{selected.node.plan}</span> : null}
                  {selected.node.level ? (
                    <span>{selected.node.isActive ? "Active" : "Inactive"}</span>
                  ) : null}
                  {selected.node.joinedAt ? <span>Joined {formatJoined(selected.node.joinedAt)}</span> : null}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
