import React, { useEffect, useMemo, useState } from "react";
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

function displayName(node) {
  return node?.nickname || node?.name || "Member";
}

function formatJoined(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN");
}

function usePageSize() {
  const query = "(max-width: 767px)";
  const [size, setSize] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(query).matches ? 3 : 5
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setSize(media.matches ? 3 : 5);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return size;
}

function PersonHead({ person }) {
  const active = Boolean(person?.isActive);
  return (
    <div className="dt-root">
      <span className={`dt-avatar dt-avatar-root ${active ? "is-active" : "is-inactive"}`} aria-hidden="true">
        <i className="bi bi-person-fill"></i>
      </span>
      <strong>{displayName(person)}</strong>
      {person?.referralCode ? <span>{person.referralCode}</span> : null}
    </div>
  );
}

function LevelTree({ person, members, onSelect }) {
  const pageSize = usePageSize();
  const [start, setStart] = useState(0);
  const [opened, setOpened] = useState(null);

  useEffect(() => {
    setStart(0);
    setOpened(null);
  }, [pageSize, person?.id]);

  const visible = members.slice(start, start + pageSize);
  const hasMore = start + pageSize < members.length;

  const openMember = (member) => {
    onSelect(member);
    setOpened((current) => (current?.id === member.id ? null : member));
  };

  return (
    <div className="dt-branch">
      <PersonHead person={person} />
      {members.length > 0 ? (
        <div className="dt-level">
          <div className="dt-level-line">
            {start > 0 && (
              <button
                type="button"
                className="dt-page dt-page-prev"
                onClick={() => setStart((value) => Math.max(0, value - pageSize))}
              >
                ‹
              </button>
            )}
            <div className="dt-bracket">
              <div className="dt-nodes">
                {visible.map((member) => (
                  <button
                    type="button"
                    key={member.id}
                    className={`dt-person${member.isActive ? " is-active" : " is-inactive"}${opened?.id === member.id ? " is-open" : ""}`}
                    onClick={() => openMember(member)}
                  >
                    <span className="dt-avatar" aria-hidden="true">
                      <i className="bi bi-person-fill"></i>
                    </span>
                    <span className="dt-person-name">{displayName(member)}</span>
                    {member.referralCode ? <span className="dt-id">{member.referralCode}</span> : null}
                  </button>
                ))}
              </div>
            </div>
            {hasMore && (
              <button
                type="button"
                className="dt-page dt-page-more"
                onClick={() => setStart((value) => value + pageSize)}
              >
                More
              </button>
            )}
          </div>
          {opened ? (
            <LevelTree
              person={opened}
              members={opened.children || []}
              onSelect={onSelect}
            />
          ) : null}
        </div>
      ) : (
        <p className="team-tree-empty">No one has joined under {displayName(person)}.</p>
      )}
    </div>
  );
}

export default function TeamTree() {
  const [levels, setLevels] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

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
  const directs = useMemo(() => {
    const linked = roots.length > 0 && levels.some((row) =>
      (row.members || []).some((member) => member.referredBy),
    );
    if (linked) return roots;
    const levelOne = levels.find((row) => row.level === 1)?.members || [];
    return levelOne.map((member) => ({
      ...member,
      id: String(member.id),
      level: 1,
      children: [],
    }));
  }, [levels, roots]);

  return (
    <div className="income-history-page team-tree-page">
      <div className="container-fluid">
        <div className="prox-live-navbar">
          <div className="prox-live-navbar-left">
            <div className="prox-live-logo">
              <i className="bi bi-diagram-2-fill"></i>
            </div>
            <div>
              <h2 className="prox-live-navbar-title">Team Tree</h2>
              <p className="prox-live-navbar-subtitle">
                Direct team under you. Open a member to see who joined under them.
              </p>
            </div>
          </div>
        </div>

        {loading && <p>Loading team tree...</p>}
        {error && <div className="app-alert error-alert">{error}</div>}

        {!loading && !error && (
          <div className="dt-tree">
            <LevelTree
              person={{
                id: me?.id || "me",
                name: myName,
                nickname: me?.nickname || "",
                referralCode: me?.referralCode || "",
                isActive: Boolean(me?.isActive),
              }}
              members={directs}
              onSelect={setSelected}
            />

            {/* {selected && (
              <div className="org-detail">
                <strong>{displayName(selected)}</strong>
                <span>Level {selected.level || 1}</span>
                {selected.phone ? <span>{selected.phone}</span> : null}
                {selected.referralCode ? <span>Code {selected.referralCode}</span> : null}
                {selected.plan ? <span>{selected.plan}</span> : null}
                <span>{selected.isActive ? "Active" : "Inactive"}</span>
                {formatJoined(selected.joinedAt) ? <span>Joined {formatJoined(selected.joinedAt)}</span> : null}
              </div>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
}
