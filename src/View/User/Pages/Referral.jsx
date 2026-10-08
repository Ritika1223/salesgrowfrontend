import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getStoredAuthUser,
  resolveAuthUserId,
  bearerAuthHeader,
} from "../../../utils/auth";
import {
  API_AUTH,
  getPublicSiteOrigin,
} from "../../../config/api";

export default function Referral() {
  const navigate = useNavigate();

  const userId = resolveAuthUserId();

  const storedUser = getStoredAuthUser();

  const storedCode =
    storedUser?.referralCode != null &&
      String(storedUser.referralCode).trim()
      ? String(storedUser.referralCode)
        .trim()
        .toUpperCase()
      : "";

  const [referralCode, setReferralCode] =
    useState(storedCode);
  const [recentReferral, setRecentReferral] =
    useState([]);

  const [totalReferrals, setTotalReferrals] =
    useState(0);

  const [loading, setLoading] = useState(true);

  const [fetchError, setFetchError] =
    useState("");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setFetchError(
        "Not logged in. Please login again."
      );
      return;
    }

    fetch(`${API_AUTH}/referral`, {
      headers: { ...bearerAuthHeader() },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.message ||
            "Could not load referral"
          );
        }

        const code = data.referralCode
          ? String(data.referralCode)
            .trim()
            .toUpperCase()
          : "";

        setReferralCode(code);
        setRecentReferral(data.data);

        setTotalReferrals(
          Number(data.totalReferrals) || 0
        );
      })
      .catch((err) => {
        setFetchError(
          err.message ||
          "Could not load referral data"
        );
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const publicOrigin = getPublicSiteOrigin();

  const referralLink = useMemo(() => {
    if (!referralCode || !publicOrigin)
      return "";

    return `${publicOrigin}/signup?ref=${referralCode}`;
  }, [referralCode, publicOrigin]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(
        referralCode
      );

      toast.success(
        "Referral code copied!"
      );
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        referralLink
      );

      toast.success(
        "Referral link copied!"
      );
    } catch {
      toast.error("Copy failed");
    }
  };

  return (

    <div className="refx-page">

      <div className="container-fluid">

        <div className="prox-live-navbar">

          <div className="prox-live-navbar-left">

            <div className="prox-live-logo">
              <i className="bi bi-gift-fill"></i>
            </div>

            <div>
              <h2 className="prox-live-navbar-title">
                Refer & Earn
              </h2>

              <p className="prox-live-navbar-subtitle">
                Invite friends and earn premium rewards together
              </p>
            </div>

          </div>

          <div className="prox-live-navbar-right">

            <button className="prox-live-outline-btn" onClick={() => navigate("/dashboard")}>
              <i className="bi bi-arrow-left"></i>
              Dashboard
            </button>

            {/* <button className="prox-live-gradient-btn" onClick={openEditModal}>
         Edit Profile
        </button> */}

          </div>

        </div>

        <div className="refx-main-card">


        <div className="row">
  {[
    {
      title: "Referral Reward",
      image: "/images/icon2.png",
      value: "75 Coins",
      icon: "bi-cash-stack",
    },
    {
      title: "Total Referrals",
      value: totalReferrals,
      icon: "bi-people-fill",
    },
    {
      title: "Bonus Status",
      value: "Active",
      icon: "bi-patch-check-fill",
    },
  ].map((item, index) => (
    <div className="col-lg-4 col-md-6" key={index}>
      <div className="refx-stat-box">

        <div className="refx-stat-icon">
          <i className={`bi ${item.icon}`}></i>
        </div>

        <span className="refx-stat-label">
          {item.title}
        </span>

        <h3 className="refx-stat-value">
          {item.image && (
            <img
              src={item.image}
              alt="Coins"
              className="refx-coin-icon"
            />
          )}
          {item.value}
        </h3>

      </div>
    </div>
  ))}
</div>

          {/* =========================
          REFERRAL CODE
          ========================= */}

          <div className="refx-copy-box">

            <div className="refx-copy-left">

              <span className="refx-copy-title">
                Your Referral Code
              </span>

              <h2 className="refx-copy-value">
                {loading
                  ? "Loading..."
                  : referralCode || "N/A"}
              </h2>

            </div>

            {/* <button
              onClick={handleCopyCode}
              disabled={!referralCode}
              className="refx-copy-action"
            >
              <i className="bi bi-copy"></i>

              Copy Code
            </button> */}

          </div>

          {/* =========================
          REFERRAL LINK
      ========================= */}

          <div className="refx-copy-box">

            <div className="refx-copy-left">

              <span className="refx-copy-title">
                Your Referral Link
              </span>

              <p className="refx-link-text">
                {loading
                  ? "Generating..."
                  : referralLink}
              </p>

            </div>

            <button
              onClick={handleCopyLink}
              disabled={!referralLink}
              className="refx-copy-action"
            >
              <i className="bi bi-link-45deg"></i>

              Copy Link
            </button>

          </div>

          {/* =========================
          SHARE BUTTONS
      ========================= */}

          <div className="refx-share-grid">

            {/* WHATSAPP */}
            <button
              onClick={() => {
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(
                    `Join ChatProX using my referral code ${referralCode} ${referralLink}`
                  )}`,
                  "_blank"
                );
              }}
              className="refx-share-btn refx-share-whatsapp"
            >
              <i className="bi bi-whatsapp"></i>

              Share on WhatsApp
            </button>

            {/* EMAIL */}
            <button
              onClick={() => {
                window.open(
                  `mailto:?subject=Join ChatProX&body=${encodeURIComponent(
                    `Use my referral code ${referralCode} and join here ${referralLink}`
                  )}`,
                  "_blank"
                );
              }}
              className="refx-share-btn refx-share-mail"
            >
              <i className="bi bi-envelope-fill"></i>

              Share via Email
            </button>

          </div>

          {/* =========================
          HOW IT WORKS
      ========================= */}

          <div className="refx-work-area">

            <div className="refx-work-head">

              <h2>
                How Referral Works
              </h2>

              <p>
                Start earning rewards in 3 simple steps
              </p>

            </div>

            <div className="row g-4">
  {[
    {
      step: "1",
      title: "Share Your Link",
      desc: "Send your referral code or referral link to your friends and followers.",
    },
    {
      step: "2",
      title: "Friend Joins",
      desc: "Your friend creates a ChatProX account using your referral code.",
    },
    {
      step: "3",
      title: "Earn Rewards",
      desc: "You instantly receive bonus coins and referral rewards.",
    },
  ].map((item, index) => (
    <div className="col-lg-4 col-md-6" key={index}>
      <div className="refx-step-box">
        <div className="refx-step-number">
          {item.step}
        </div>

        <div className="refx-step-content">
          <h4>{item.title}</h4>
          <p>{item.desc}</p>
        </div>
      </div>
    </div>
  ))}
</div>

          </div>

          {/* =========================
          REFERRAL HISTORY
      ========================= */}

          <div className="refx-referral-history">

            <div className="refx-history-head">

              <h2>
                Recent Referrals
              </h2>

              <button>
                View All
              </button>

            </div>

            <div className="refx-history-list">

              {recentReferral.map((item, index) => (

                <div className="refx-history-item" key={index}>

                  {/* LEFT */}
                  <div className="refx-history-user">

                    <div className="refx-history-avatar">

                      {item?.profilePhoto ? (

                        <img
                          src={item.profilePhoto}
                          alt={item?.name}
                        />

                      ) : (

                        <span>
                          <img src="/images/user.jpg" />
                        </span>

                      )}


                    </div>

                    <div>

                      <h4>
                        {item.referralName}
                      </h4>

                      <p>
                        Joined using your referral code
                      </p>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="refx-history-right">

                    <span>
                      <img src="/images/coin.png" className="w-30" />+{item.amount}
                    </span>

                    <small>
                      {item.date.split('T')[0]}
                    </small>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* ERROR */}
          {fetchError && (
            <div className="refx-error-text">
              {fetchError}
            </div>
          )}

        </div>

      </div>

    </div>


  );
}