import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_AUTH, API_CHAT } from "../../../config/api";
import { appRoute, resolveAuthUserId, authJsonHeaders, canUseMemberFeatures } from "../../../utils/auth";
import AuthPromptModal from "../Componets/AuthPromptModal";

const DEMO_GIRL_AVATAR = "/images/avtar.png";

export default function LiveBrowse() {
  const navigate = useNavigate();
  const myId = resolveAuthUserId();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isHostProfile, setIsHostProfile] = useState(false);
  // Cache of hostUid to profilePhoto url mapping
  const [hostProfilePhotos, setHostProfilePhotos] = useState({});
  // Cache of hostUid to gallery images mapping
  const [hostGalleryPhotos, setHostGalleryPhotos] = useState({});
  const [authOpen, setAuthOpen] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await axios.get(`${API_CHAT}/live/active`);
      setSessions(res.data?.sessions || []);
    } catch (err) {
      setSessions([]);
      setError(err?.response?.data?.message || "Could not load live chats");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all live rooms and auto-refresh
  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  // Fetch if user is a host
  useEffect(() => {
    if (!myId) return;
    axios
      .get(`${API_AUTH}/user/me`, { headers: authJsonHeaders() })
      .then((r) => {
        setIsHostProfile((r.data?.user?.profileMode || "user") === "host");
      })
      .catch(() => setIsHostProfile(false));
  }, [myId]);

  // Fetch profile photo and gallery for each hostUid in sessions, if not already present
  useEffect(() => {
    if (!myId) return;
    const neededHostUids = sessions
      .map((s) =>
        s.hostId && typeof s.hostId === "object" && s.hostId._id
          ? s.hostId._id
          : s.hostId || null
      )
      .filter((uid) => !!uid);

    // Profile photo
    const toFetchPhoto = neededHostUids.filter(
      (uid) => !(uid in hostProfilePhotos)
    );
    // Gallery
    const toFetchGallery = neededHostUids.filter(
      (uid) => !(uid in hostGalleryPhotos)
    );

    toFetchPhoto.forEach((uid) => {
      axios
        .get(`${API_AUTH}/user/by-id/${uid}`, { headers: authJsonHeaders() })
        .then((res) => {
          const photo = res.data?.user?.profilePhoto;
          setHostProfilePhotos((prev) => ({
            ...prev,
            [uid]: photo || null,
          }));
        })
        .catch(() => {
          setHostProfilePhotos((prev) => ({
            ...prev,
            [uid]: null,
          }));
        });
    });

    toFetchGallery.forEach((uid) => {
      axios
        .get(`${API_AUTH}/user/by-id/${uid}`, { headers: authJsonHeaders() })
        .then((res) => {
          // Try to extract gallery array (possibly called .gallery or .galleryPhotos)
          let gallery =
            res.data?.user?.gallery && Array.isArray(res.data.user.gallery)
              ? res.data.user.gallery
              : res.data?.user?.galleryPhotos && Array.isArray(res.data.user.galleryPhotos)
                ? res.data.user.galleryPhotos
                : [];
          // Gallery images must be normal URLs/string paths
          gallery = gallery.filter(Boolean);
          setHostGalleryPhotos((prev) => ({
            ...prev,
            [uid]: gallery,
          }));
        })
        .catch(() => {
          setHostGalleryPhotos((prev) => ({
            ...prev,
            [uid]: [],
          }));
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  const goRoom = (sessionId) => {
    if (!sessionId) return;
    navigate(appRoute(`live/${sessionId}`));
  };

  const requireMember = (e) => {
    if (e) e.preventDefault();
    if (canUseMemberFeatures()) return false;
    setAuthOpen(true);
    return true;
  };

  // Find "own live" session (where I am host), and others
  let ownLiveSession = null;
  let otherSessions = [];
  sessions.forEach((s) => {
    const host = s.hostId;
    const hostUid =
      host && typeof host === "object" && host._id
        ? host._id
        : host || null;
    if (myId && hostUid && String(myId) === String(hostUid)) {
      if (!ownLiveSession) ownLiveSession = s; // use first one if there are somehow multiple
    } else {
      otherSessions.push(s);
    }
  });

  const gridSessions = ownLiveSession
    ? [ownLiveSession, ...otherSessions]
    : otherSessions;

  // Show a background images slider for given array of images
  const ChatBackgroundSlider = ({ images = [], interval = 5000 }) => {
    const [current, setCurrent] = useState(0);
    useEffect(() => {
      if (!images.length) return;
      const id = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, interval);
      return () => clearInterval(id);
    }, [images, interval]);
    if (!images || !images.length) return null;
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
        }}
      />
    );
  };

  return (
    <div className="prox-live-page">
      <div className="container-fluid">
        {/* =======================
        HEADER BAR
    ======================= */}
        <div className="prox-live-navbar">
          <div className="prox-live-navbar-left">
            <div className="prox-live-logo">
              <i className="bi bi-broadcast"></i>
            </div>
            <div>
              <h2 className="prox-live-navbar-title">
                MLM Live
              </h2>
              <p className="prox-live-navbar-subtitle">
                Discover and join live chat rooms
              </p>
            </div>
          </div>
        <div className="prox-live-navbar-right">
            <button className="prox-live-outline-btn">
              Trending
            </button>
            <button
              className="prox-live-gradient-btn"
              onClick={(e) => requireMember(e)}
            >
              + Go Live
            </button>
          </div>
        </div>
        {!canUseMemberFeatures() && (
          <div className="cp-guest-banner">
            You are watching as a guest. Register to send messages, chat, and use wallet.
            <button type="button" onClick={() => setAuthOpen(true)}>Register / Sign in</button>
          </div>
        )}
        {loading && (
          <div className="prox-live-message-box">
            Loading live sessions...
          </div>
        )}
        {error && (
          <div className="prox-live-error-box">
            {error}
          </div>
        )}
        {!loading && !sessions.length && !error && (
          <div className="prox-live-empty-box">
            No one is live right now.
          </div>
        )}
        {/* =======================
        LIVE GRID
    ======================= */}
        <div className="prox-live-grid">
          {gridSessions.map((s) => {
            const sid = s._id || s.id;
            const host = s.hostId;
            const hostUid =
              host && typeof host === "object" && host._id
                ? host._id
                : host || null;

            const hostName =
              (typeof host === "object" && host?.name) || "Host";

            const count =
              typeof s.participantCount === "number"
                ? s.participantCount
                : Array.isArray(s.participantIds)
                  ? s.participantIds.length
                  : 0;

            let hostPhoto =
              (typeof host === "object" && host?.profilePhoto) ||
              (hostUid ? hostProfilePhotos[hostUid] : null);
            if (!hostPhoto) {
              hostPhoto = DEMO_GIRL_AVATAR;
            }
            const isOwnLive =
              myId &&
              hostUid &&
              String(myId) === String(hostUid);

            // Use host's gallery photos if available, fallback to profile photo
            let gallery =
              (typeof host === "object" && Array.isArray(host?.gallery) && host.gallery.length)
                ? host.gallery.filter(Boolean)
                : (hostGalleryPhotos[hostUid] && hostGalleryPhotos[hostUid].length)
                  ? hostGalleryPhotos[hostUid]
                  : [hostPhoto];

            return (
              <div
                key={sid}
                className="prox-live-card"
                data-guest-ok="true"
                style={{ position: "relative", overflow: "hidden" }}
                onClick={() => goRoom(sid)}
              >
                {/* Use background slider for host gallery photos */}
                <ChatBackgroundSlider images={gallery} interval={3500} />

                <div className="prox-live-overlay"></div>
                {/* TOP */}
                <div className="prox-live-card-top">
                  <div className="prox-live-badge">
                    <span className="prox-live-pulse"></span>
                    LIVE
                  </div>
                  <div className="prox-live-joined">
                    {count} Joined
                  </div>
                </div>
                {/* BOTTOM CONTENT */}
                <div className="prox-live-card-content">
                  <div className="prox-live-user-info">
                    {/* Always show only profile photo at user/avatar spot */}
                    <img
                      src={hostPhoto}
                      alt={hostName}
                      className="prox-live-avatar"
                    />
                    <div>
                      <h3>
                        {isOwnLive
                          ? "Your Live"
                          : s.title || "Live Room"}
                      </h3>
                      <p>
                        Hosted by {hostName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="prox-live-join-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      goRoom(sid);
                    }}
                  >
                    Join Room
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <AuthPromptModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
