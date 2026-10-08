import React from "react";
import axios from "axios";
import { API_BASE } from "../../../config/api";
import { PlanDpRing } from "../../User/Componets/PlanCrown";

const API_BASE_URL = API_BASE;

export function formatMessageDate(dateInput) {
  const d = new Date(dateInput);
  const today = new Date();
  const yester = new Date();
  yester.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yester)) return "Yesterday";

  const tomor = new Date();
  tomor.setDate(today.getDate() + 1);
  if (sameDay(d, tomor)) return "Tomorrow";

  const options = {
    day: "2-digit",
    month: "short",
  };
  if (d.getFullYear() !== today.getFullYear()) {
    options.year = "numeric";
  }
  return d.toLocaleDateString(undefined, options);
}

export function formatTime(dateInput) {
  const d = new Date(dateInput);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getConversationPreview(conversation) {
  const c = conversation || {};

  let lastMsg = "Any update?";
  if (c.lastMessage) {
    if (c.type === "image") lastMsg = "[Image]";
    else if (c.type === "video") lastMsg = "[Video]";
    else if (c.type === "audio") lastMsg = "[Audio]";
    else if (c.type === "file") lastMsg = "[File]";
    else if (c.type === "sticker") lastMsg = "[Sticker]";
    else lastMsg = c.lastMessage;
  }

  const lastMsgTime = c.updatedAt ? formatTime(c.updatedAt) : "--:--";
  const unreadCount = Number(c.unreadCount) || 0;

  return { lastMsg, lastMsgTime, unreadCount };
}

function renderReadStatus(msg, isMe) {
  if (!isMe) return null;
  const isRead = Boolean(msg.isRead);
  return (
    <span
      className={`cp-read-status ${isRead ? "read" : "unread"}`}
      title={isRead ? "Read" : "Sent"}
    >
      {isRead ? "✓✓" : "✓"}
    </span>
  );
}

function renderUnreadBadge(count) {
  const n = Number(count) || 0;
  if (n <= 0) return null;
  return (
    <span className="cp-unread-badge" aria-label={`${n} unread messages`}>
      {n > 99 ? "99+" : n}
    </span>
  );
}

function toAbsoluteUrl(maybeRelativeUrl, baseUrl) {
  const raw = String(maybeRelativeUrl || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `${window.location.protocol}${raw}`;
  const base = String(baseUrl || "").replace(/\/+$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return base ? `${base}${path}` : path;
}

function isUploadImagePath(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  // Common server pattern: "/uploads/file.png"
  if (!raw.startsWith("/uploads/")) return false;
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(raw);
}

export function renderDirectMessagesWithDates({ msgs, myId, assetBaseUrl, onEdit }) {
  return (msgs || []).map((msg, idx) => {
    const dt = new Date(msg.createdAt || msg.date || msg.time || Date.now());
    const label = formatMessageDate(dt);
    const showDate =
      idx === 0 ||
      formatMessageDate(
        new Date(
          msgs[idx - 1]?.createdAt || msgs[idx - 1]?.date || Date.now(),
        ),
      ) !== label;
    const isMe = String(msg.senderId) === String(myId);
    const msgType = msg.type || msg.messageType;

    // --- FILE IMAGE PREVIEW SUPPORT ---
    if (msg.messageType === "file" && msg.file) {
      const fileUrl = toAbsoluteUrl(msg.file, assetBaseUrl);
      const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(msg.file);
      const fileName = typeof msg.file === "string" ? msg.file.split("/").pop() : (msg.file?.fileName || "file");
      return (
        <React.Fragment key={msg._id || idx}>
          {showDate && (
            <div className="chat-date">
              <span>{label}</span>
            </div>
          )}
          <div className={`message file-message ${isMe ? "right" : "left"}`}>
            {isImage && (
              <a href={fileUrl} target="_blank" rel="noreferrer">
                <img
                  src={fileUrl}
                  alt={fileName}
                  class="cp-msg-sticker-img"
                />
              </a>
            )}
            <div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
              >
                📎 {fileName}
              </a>
              <div className="time">
                {formatTime(msg.createdAt || msg.date || Date.now())}
                {renderReadStatus(msg, isMe)}
              </div>
            </div>
            {isMe && (
              <span
                className="edit-message-btn"
                title="Edit message"
                onClick={() => {
                  onEdit?.(msg);
                }}
              >
                <i class="bi bi-pencil-square"></i>
              </span>
            )}
          </div>
        </React.Fragment>
      );
    }

    // STICKER or Upload Image
    if (msgType === "sticker" || msg.sticker || isUploadImagePath(msg.message)) {
      const stickerSrc = toAbsoluteUrl(
        msg.sticker?.imageUrl || msg.message,
        assetBaseUrl,
      );
      return (
        <React.Fragment key={msg._id || idx}>
          {showDate && (
            <div className="chat-date">
              <span>{label}</span>
            </div>
          )}
          <div
            className={`message sticker-message ${isMe ? "right" : "left"}`}
          >
            <img
              src={stickerSrc}
              alt={msg.sticker?.name || "Sticker"}
              className="cp-msg-sticker-img"
            />
            <div className="time cp-msg-time-right" style={{ alignSelf: "flex-end" }}>
              {formatTime(msg.createdAt || msg.date || Date.now())}
              {renderReadStatus(msg, isMe)}
              {msg.sticker?.cost || msg.cost ? (
                <div className="cp-msg-cost">
                  {msg.sticker?.cost || msg.cost} coins
                </div>
              ) : null}
            </div>
            {isMe && (
              <span
                className="edit-message-btn"
                title="Edit message"
                onClick={() => {
                  onEdit?.(msg);
                }}
              >
                <i class="bi bi-pencil-square"></i>
              </span>
            )}
          </div>
        </React.Fragment>
      );
    }

    // TEXT msg or fallback
    return (
      <React.Fragment key={msg._id || idx}>
        {showDate && (
          <div className="chat-date">
            <span>{label}</span>
          </div>
        )}
        <div
          className={`message ${isMe ? "right" : "left"}`}
          style={{ position: "relative" }}
        >
          {msg.message}
          <div className="time">
            {formatTime(msg.createdAt || msg.date || Date.now())}
            {renderReadStatus(msg, isMe)}
            {msg.cost ? (
              <div className="cp-msg-cost">{msg.cost} coins</div>
            ) : null}
          </div>
          {isMe && (
            <span
              className="edit-message-btn"
              title="Edit message"
              onClick={() => {
                onEdit?.(msg);
              }}
            >
              <i class="bi bi-pencil-square"></i>
            </span>
          )}
        </div>
      </React.Fragment>
    );
  });
}

export function renderGroupMessagesWithDates({ msgs, myId, assetBaseUrl }) {
  return (msgs || []).map((msg, idx) => {
    const dt = new Date(msg.createdAt || msg.date || msg.time || Date.now());
    const label = formatMessageDate(dt);
    const prev = msgs[idx - 1];
    const prevDt = new Date(
      prev?.createdAt || prev?.date || prev?.time || Date.now(),
    );
    const prevLabel = formatMessageDate(prevDt);
    const showDate = idx === 0 || prevLabel !== label;

    const isMine = msg.senderId === myId;

    const msgType = msg.type || msg.messageType;
    if (msgType === "sticker" || msg.sticker || isUploadImagePath(msg.message)) {
      const stickerSrc = toAbsoluteUrl(
        msg.sticker?.imageUrl || msg.message,
        assetBaseUrl,
      );

      return (
        <React.Fragment key={msg._id || idx}>
          {showDate && (
            <div className="chat-date">
              <span>{label}</span>
            </div>
          )}
          <div className={`message sticker-message ${isMine ? "right" : "left"}`}>
            {!isMine && (
              <div className="cp-group-sender">
                {msg.senderName ||
                  msg.sender?.name ||
                  msg.senderUsername ||
                  "Member"}
              </div>
            )}
            <img
              src={stickerSrc}
              alt={msg.sticker?.name || "Sticker"}
              className="cp-msg-sticker-img"
            />
            <div className="time cp-msg-time-right">
              {formatTime(msg.createdAt || msg.date || Date.now())}
              {msg.sticker?.cost || msg.cost ? (
                <span className="cp-msg-cost">
                  {msg.sticker?.cost || msg.cost} coins
                </span>
              ) : null}
            </div>
          </div>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={msg._id || idx}>
        {showDate && (
          <div className="chat-date">
            <span>{label}</span>
          </div>
        )}

        <div className={`message ${isMine ? "right" : "left"}`}>
          {!isMine && (
            <div
              className="cp-group-sender"
            >
              {msg.senderName ||
                msg.sender?.name ||
                msg.senderUsername ||
                "Member"}
            </div>
          )}
          {msg.message}
          <div className="time">
            {formatTime(msg.createdAt || msg.date || Date.now())}
            {msg.cost ? (
              <span
                className="cp-msg-cost"
              >
                {msg.cost} coins
              </span>
            ) : null}
          </div>
        </div>
      </React.Fragment>
    );
  });
}


const COIN_ICON = "/images/icon2.png";

export function formatCompactCount(value) {
  const num = Math.max(0, Number(value) || 0);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(num >= 10000000 ? 0 : 1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1).replace(/\.0$/, "")}K`;
  }
  return String(num);
}

export function normalizeSex(sex) {
  const s = String(sex || "").trim().toUpperCase();
  if (s === "M" || s === "MALE") return "male";
  if (s === "F" || s === "FEMALE") return "female";
  return "";
}

export function genderLabel(sex) {
  const g = normalizeSex(sex);
  if (g === "male") return "Male";
  if (g === "female") return "Female";
  return "";
}

export function normalizeCategory(category) {
  return String(category || "").trim().toUpperCase();
}

export function matchesPeopleFilter(user, peopleFilter) {
  const filter = String(peopleFilter || "all").toLowerCase();
  if (!filter || filter === "all") return true;
  if (filter === "male" || filter === "female") {
    return normalizeSex(user?.sex) === filter;
  }
  return normalizeCategory(user?.category) === filter.toUpperCase();
}

function followerCount(user) {
  if (Array.isArray(user?.followers)) return user.followers.length;
  return Number(user?.followers) || 0;
}

function earnedAmount(user) {
  return Math.max(0, Number(user?.totalEarned ?? user?.totalEarning ?? 0) || 0);
}

function renderDiscoverChatCard({
  user,
  selectedUser,
  lastConversations,
  unreadCounts,
  onSelectUser,
}) {
  const avatarImg = user?.profilePhoto;
  const isHost = user?.profileMode === "host";
  const isOnline = user?.isActive !== false;
  const conversation = (lastConversations || {})[user._id] || {};
  const unreadFromMap = (unreadCounts || {})[String(user._id)] || 0;
  const { lastMsg, unreadCount } = getConversationPreview({
    ...conversation,
    unreadCount: conversation.unreadCount ?? unreadFromMap,
  });
  const gender = genderLabel(user?.sex);
  const category = normalizeCategory(user?.category);
  const location =
    user?.city || user?.location || user?.state || "";
  const age = user?.age || user?.dobAge;
  const initial = (user?.nickname || user?.name || "?").charAt(0).toUpperCase();

  return (
    <div
      key={user._id}
      className={`chat-item cp-disc-card ${selectedUser?._id === user._id ? "active" : ""}`}
      onClick={() => {
        onSelectUser(user);
      }}
    >
      <PlanDpRing
        plan={user?.plan}
        className="cp-disc-avatar"
        overlay={<span className={`status-dot ${isOnline ? "online" : "offline"}`} />}
      >
        {avatarImg ? <img src={avatarImg} alt="" /> : initial}
      </PlanDpRing>

      <div className="cp-disc-main">
        <div className="cp-disc-name-row">
          <span className="cp-disc-name">{user.nickname || user.name || "Unknown"}</span>
          {isHost ? <span className="cp-disc-host">HOST</span> : null}
        </div>

        <div className="cp-disc-meta">
          {age ? <span className="cp-disc-meta-item">{age}</span> : null}
          {gender ? (
            <span className="cp-disc-meta-item">
              <i
                className={`bi ${normalizeSex(user?.sex) === "female" ? "bi-gender-female" : "bi-gender-male"}`}
                aria-hidden="true"
              />
              {gender}
            </span>
          ) : null}
          {category ? <span className="cp-disc-size">{category}</span> : null}
        </div>

        {location ? (
          <div className="cp-disc-location">
            <i className="bi bi-geo-alt-fill" aria-hidden="true" />
            {location} <span className="cp-discover-newbie">
                <i className="bi bi-star-fill" aria-hidden="true" />
                {user?.poolRank || user?.bonusRank || "Newbie"}
              </span>
          </div>
        ) : null}
        

        <div className="cp-disc-preview">
          <span className={`chat-message${unreadCount > 0 ? " has-unread" : ""}`}>

          </span>
          {renderUnreadBadge(unreadCount)}
        </div>
      </div>

      <div className="cp-disc-stats">
        <div className="cp-disc-earn">
          <img src={COIN_ICON} alt="" className="cp-disc-coin" />
          <div>
            <strong>{formatCompactCount(earnedAmount(user))}</strong>
            <span>Earn</span>
          </div>
        </div>
        <div className="cp-disc-followers">
          <i className="bi bi-people-fill" aria-hidden="true" />
          <span>{formatCompactCount(followerCount(user))}</span>
          <small>Followers</small>
        </div>
      </div>
    </div>
  );
}

export function createRenderHostChatItem({
  myId,
  selectedUser,
  lastConversations,
  unreadCounts,
  onSelectUser,
}) {
  return (user) => {
    if (String(user?._id) === String(myId)) return null;
    if (user.profileMode !== "host") return null;
    return renderDiscoverChatCard({
      user,
      selectedUser,
      lastConversations,
      unreadCounts,
      onSelectUser,
    });
  };
}

export function createRenderUserChatItem({
  myId,
  selectedUser,
  lastConversations,
  unreadCounts,
  onSelectUser,
}) {
  return (user) => {
    if (String(user?._id) === String(myId)) return null;
    return renderDiscoverChatCard({
      user,
      selectedUser,
      lastConversations,
      unreadCounts,
      onSelectUser,
    });
  };
}

export function createRenderGroupChatItem({
  selectedGroup,
  setSelectedGroup,
  setSelectedUser,
}) {
  return (group) => {
    const groupId = group?._id || group?.id;
    return (

      <div
        key={groupId}
        className={`chat-item mt-2 ${selectedGroup?._id === groupId ? "active" : ""}`}
        onClick={() => {
          setSelectedGroup(group);
          setSelectedUser(null);
        }}
      >



        <div className="chat-avatar">
          {(group?.name?.[0] || "G").toUpperCase()}
        </div>
        <div className="chat-content">
          <div className="chat-top">
            <span className="chat-name">{group?.name || "Untitled group"}</span>
            <span className="chat-time">Group chat</span>

          </div>
          <div className="chat-bottom">
            <span className="chat-message">Any update?</span>
          </div>
        </div>
      </div>


    );
  };
}

export async function createGroup({
  apiBaseUrl,
  groupName,
  myId,
  groupMemberIds,
  setGroupModalOpen,
  setGroupName,
  setGroupMemberIds,
  setMenuOpen,
  setSelectedUser,
  setSelectedGroup,
  setPendingSelectGroupId,
  fetchGroups,
  toast,
}) {
  const name = (groupName || "").trim();
  if (!name) return toast("Enter group name");
  if (!myId) return toast("User id missing");
  if (!Array.isArray(groupMemberIds) || groupMemberIds.length === 0)
    return toast("Select at least one member");

  try {
    const res = await axios.post(`${apiBaseUrl}/chat/create-group`, {
      name,
      members: groupMemberIds,
      createdBy: myId,
    });

    const createdGroupId = res.data?._id || res.data?.groupId || res.data?.id;

    setGroupModalOpen(false);
    setGroupName("");
    setGroupMemberIds([]);
    setMenuOpen(false);

    setSelectedUser(null);
    if (createdGroupId) {
      setSelectedGroup({ _id: createdGroupId, name });
      setPendingSelectGroupId(createdGroupId);
    }

    await fetchGroups();
  } catch (err) {
    toast(err.response?.data?.message || "Error creating group");
  }
}

