import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import EmojiPicker from "emoji-picker-react";
import { API_BASE, API_AUTH, getApiOrigin } from "../../../config/api";
import { appRoute, resolveAuthUserId, authJsonHeaders, canUseMemberFeatures } from "../../../utils/auth";
import AuthPromptModal from "../Componets/AuthPromptModal";
import StickersBar from "../../Chat/Componets/StickersBar";
import { renderGroupMessagesWithDates } from "../../Chat/Componets/chatModules";

const API_BASE_URL = API_BASE;
const DEMO_GIRL_AVATAR = "/images/avtar.png";

function ChatBackgroundSlider({ images = [], interval = 5000 }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!images.length) return;
    setCurrent(0); // reset on new set
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images, interval]);

  if (!images || images.length === 0) {
    return (
      <div
        className="cp-chat-bg-slider"
        style={{
          position: "absolute",
          zIndex: 0,
          inset: 0,
          width: "100%",
          height: "100%",
          background: `url(${DEMO_GIRL_AVATAR}) center center/cover no-repeat`,
          opacity: 1,
          transition: "background-image 0.8s ease",
          pointerEvents: "none",
          borderRadius: 18,
        }}
      />
    );
  }

  return (
    <div
      className="cp-chat-bg-slider"
      style={{
        position: "absolute",
        zIndex: 0,
        inset: 0,
        width: "100%",
        height: "100%",
        background: `url(${images[current]}) center center/cover no-repeat`,
        opacity: 1,
        transition: "background-image 0.8s ease",
        pointerEvents: "none",
        borderRadius: 18,
      }}
    />
  );
}

export default function LiveRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const myId = resolveAuthUserId();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hostProfile, setHostProfile] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const member = canUseMemberFeatures();

  const API_ORIGIN = getApiOrigin(API_BASE_URL);

  const hostUid =
    session?.hostId && typeof session.hostId === "object"
      ? session.hostId._id
      : session?.hostId;
  const hostName =
    (session?.hostId && typeof session.hostId === "object" && session.hostId.name) ||
    "Host";
  const isHost = Boolean(myId && hostUid && String(myId) === String(hostUid));
  const isActive = session?.status === "active";

  // Fetch host profile and gallery
  useEffect(() => {
    if (!hostUid) return;
    if (session?.hostId && typeof session.hostId === "object") {
      const host = session.hostId;
      if (host.profilePhoto || host.name) {
        setHostProfile((prev) => prev || host);
      }
      if (Array.isArray(host.gallery) && host.gallery.length) {
        setGalleryPhotos(host.gallery.filter(Boolean));
      } else if (host.profilePhoto) {
        setGalleryPhotos([host.profilePhoto]);
      }
    }
    if (!member) return;
    axios
      .get(`${API_AUTH}/user/by-id/${hostUid}`, { headers: authJsonHeaders() })
      .then(res => {
        const user = res.data?.user || null;
        setHostProfile(user);
        if (user?.gallery && Array.isArray(user.gallery) && user.gallery.length > 0) {
          setGalleryPhotos(user.gallery.filter(url => !!url));
        } else if (user?.profilePhoto) {
          setGalleryPhotos([user.profilePhoto]);
        } else {
          setGalleryPhotos([DEMO_GIRL_AVATAR]);
        }
      })
      .catch(() => {
        setGalleryPhotos([DEMO_GIRL_AVATAR]);
      });
  }, [hostUid, member, session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!sessionId || !myId) return;
    axios
      .post(`${API_BASE_URL}/chat/live/${sessionId}/join`, { userId: myId })
      .catch(() => { });
  }, [sessionId, myId]);

  const load = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/chat/live/${sessionId}/messages`,
      );
      setMessages(res.data?.messages || []);
      setSession(res.data?.session || null);
    } catch (err) {
      toast(err?.response?.data?.message || "Could not load live room");
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, [sessionId, load]);

  const requireMember = () => {
    if (member) return true;
    setAuthOpen(true);
    return false;
  };

  const sendMessage = async () => {
    if (!requireMember()) return;
    if (!text.trim() || !sessionId || !myId || !isActive) return;
    try {
      await axios.post(`${API_BASE_URL}/chat/send-message`, {
        senderId: myId,
        receiverId: isHost ? null : hostUid,
        liveSessionId: sessionId,
        message: text,
        type: "text",
      });
      setText("");
      load();
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to send");
    }
  };

  const sendSticker = async (sticker) => {
    if (!requireMember()) return;
    if (!sticker || !sessionId || !myId || !isActive) return;
    try {
      await axios.post(`${API_BASE_URL}/chat/send-message`, {
        senderId: myId,
        receiverId: isHost ? null : hostUid,
        liveSessionId: sessionId,
        message: sticker.imageUrl,
        type: "sticker",
        sticker: {
          name: sticker.name,
          slug: sticker.slug,
          cost: sticker.cost,
          imageUrl: sticker.imageUrl,
        },
        cost: sticker.cost,
      });
      load();
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to send sticker");
    }
  };

  function isMyMsg(msg, myId) {
    return String(msg.senderId) === String(myId);
  }

  function CustomRenderMessagesWithDates({ msgs, myId, assetBaseUrl }) {
    if (!msgs?.length) return null;
    return (
      <div>
        {msgs.map((msg, idx) => {
          const mine = isMyMsg(msg, myId);

          let bubbleStyle = {
            maxWidth: "88%",
            whiteSpace: "pre-line",
            padding: "5px 16px",
            marginBottom: 10,
            borderRadius: 16,
            fontSize: 12,
            textShadow: "1px 1px 1px #000",
            wordBreak: "break-word",
            border: "1.5px solid transparent"
          };

          let nameStyle = {
            fontSize: 12,
            marginBottom: 3,
            color: "#a640ec",
            TextShadow: "1px 1px 1px #000",
            lineHeight: 1.0
          };

          if (mine) {
            bubbleStyle.alignSelf = "flex-end";
          } else {
            bubbleStyle.alignSelf = "flex-start";
            bubbleStyle.textshadow = "1px 1px 1px #000";
            bubbleStyle.fontSize = 12;
          }

          let senderName = "";
          if (!mine) {
            if (msg.senderName) senderName = msg.senderName;
            else if (msg.sender && msg.sender.name) senderName = msg.sender.name;
            else if (msg.senderId && hostProfile && msg.senderId === hostProfile._id) senderName = hostProfile.name || hostName;
            else if (msg.senderId === hostProfile?._id) senderName = hostProfile.name || hostName;
            if (!senderName && msg.senderId && hostUid && msg.senderId === hostUid) senderName = hostName;
            if (!senderName) senderName = "User";
          }

          if (msg.type === "sticker" && msg.sticker) {
            return (
              <div
                key={msg._id || idx}
                style={{
                  display: "flex",
                  flexDirection: mine ? "row-reverse" : "row",
                  alignItems: "center",
                  marginBottom: 12,
                  gap: 12,
                }}
              >
                <div style={{
                  ...bubbleStyle,
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: mine ? "#4e37d6" : "#171928",
                  border: mine ? "1.5px solid #7968fe" : "2.5px solid #272938",
                }}>
                  {!mine && (
                    <div style={{ ...nameStyle, color: "#76bcfe", marginBottom: 3, opacity: 0.92, alignSelf: "flex-start" }}>
                      {senderName}
                    </div>
                  )}
                  <img
                    src={msg.sticker.imageUrl}
                    alt={msg.sticker.name}
                    style={{
                      width: 58, height: 58,
                      objectFit: "contain",
                      borderRadius: 12,
                      boxShadow: "0 2px 10px #000b"
                    }}
                  />
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg._id || idx}
              style={{
                display: "flex",
                flexDirection: mine ? "row-reverse" : "row",
                alignItems: "flex-end",
              }}
            >
              <div style={bubbleStyle}>
                {!mine && (
                  <div style={nameStyle}>
                    {senderName}
                  </div>
                )}
                {msg.messageType === 'sticker'
                  ? (
                    <img
                      src={`${API_ORIGIN}${msg.message}`}
                      alt={`${API_ORIGIN}${msg.message}`}
                      style={{
                        width: 52,
                        height: 52,
                        objectFit: 'contain'
                      }}
                    />
                  )
                  : (
                    msg.message
                  )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const endLive = async () => {
    if (!sessionId || !myId || !isHost) return;
    try {
      await axios.post(`${API_BASE_URL}/chat/live/${sessionId}/end`, {
        userId: myId,
      });
      toast("Live ended");
      navigate(appRoute("live"));
    } catch (err) {
      toast(err?.response?.data?.message || "Could not end live");
    }
  };

  if (!sessionId) {
    return (
      <div className="cp-live-room">
        <p className="cp-live-browse-muted">Missing session.</p>
      </div>
    );
  }

  return (
    <div className="app-live-room">
      {/* LIVE BG */}
      <div className="live-bg-overlay"></div>
      {/* TOP HEADER */}
      <div className="live-top-bar">
        <button
          type="button"
          className="live-back-btn"
          onClick={() => navigate(appRoute("live"))}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <div className="live-host-info">
          <div className="live-host-img-wrap">
            <img
              src={
                hostProfile?.profilePhoto
                  ? hostProfile.profilePhoto
                  : DEMO_GIRL_AVATAR
              }
              alt={hostName}
              className="live-host-img"
            />
            <span className="live-dot"></span>
          </div>

          <div className="live-host-text">
            <h4>{session?.title || "Live Chat"}</h4>

            <div className="live-host-sub">
              <span>{hostName}</span>
              {isActive ? (
                <div className="live-badge">
                  LIVE
                </div>
              ) : (
                <div className="ended-badge">
                  ENDED
                </div>
              )}
            </div>
          </div>
        </div>

        {isHost && isActive && (
          <button
            type="button"
            className="live-end-btn"
            onClick={endLive}
          >
            End Live
          </button>
        )}
      </div>
      {/* LIVE CHAT AREA */}
      <div className="live-chat-wrapper">
        {/* Gallery photo slider as animated background */}
        <ChatBackgroundSlider images={galleryPhotos} interval={5000} />
        {/* Overlay for max contrast - REMOVED for clear gallery photo, per instructions */}
        {/* <div className="live-chat-overlay" style={{
          background: "rgba(10, 11, 24, 0.97)",
          width: "100%",
          height: "100%",
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 1,
          borderRadius: 18
        }}></div> */}
        {/* MESSAGES */}
        <div className="live-messages-area">
          {messages.length === 0 ? (
            <div className="no-message-box">
              <i className="bi bi-chat-heart"></i>
              <p>No messages yet</p>
            </div>
          ) : (
            <>
              <CustomRenderMessagesWithDates
                msgs={messages}
                myId={myId}
                assetBaseUrl={API_ORIGIN}
              />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
      {/* STICKERS */}
      <div
        className="live-sticker-bar"
        onClick={(e) => {
          if (!member) {
            e.preventDefault();
            e.stopPropagation();
            requireMember();
          }
        }}
      >
        <StickersBar
          apiBaseUrl={API_BASE_URL}
          onSelectSticker={sendSticker}
        />
      </div>
      {/* CHAT INPUT */}
      <div
        className="live-chat-input-area"
        onClick={() => {
          if (!member) requireMember();
        }}
      >
        {showEmojiPicker && member && (
          <div className="live-emoji-picker">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setText((prev) => prev + (emojiData.emoji || ""));
                setShowEmojiPicker(false);
              }}
              theme="dark"
              width={320}
            />
          </div>
        )}

        <button
          type="button"
          className="emoji-btn"
          onClick={() => {
            if (!requireMember()) return;
            setShowEmojiPicker((v) => !v);
          }}
        >
          😊
        </button>

        <input
          className="live-chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            !member
              ? "Sign in to send a message"
              : isActive
                ? isHost
                  ? "Message everyone..."
                  : "Message host (2 coins)"
                : "Live has ended"
          }
          disabled={!isActive || !member}
          onFocus={() => {
            if (!member) requireMember();
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          type="button"
          className="live-send-btn"
          onClick={sendMessage}
          disabled={!isActive}
        >
          <i className="bi bi-send-fill"></i>
        </button>
      </div>
      <AuthPromptModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title="Login to send messages"
        message="Guests can watch this live. Register or sign in to chat, send stickers, and use other features."
      />
    </div>
  );
}
