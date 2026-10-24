import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { clearGuest, isGuest, getGuestProfile } from "../../../utils/auth";
import GuestActionGuard from "./GuestActionGuard";
import { INCOME_REPORTS } from "../Pages/History";


function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken"); // if you use refresh tokens
  localStorage.removeItem("auth_user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("chat_active_peer");
  sessionStorage.removeItem("chat_active_group");
  clearGuest();
  
  window.location.href = "/";
}

const NAV_LINKS = [
  {
  to: "dashboard",
  icon: <i className="bi bi-grid-1x2-fill"></i>,
  label: "Dashboard",
},




{
  to: "referral",
  icon: <i className="bi bi-people-fill"></i>,
  label: "Referrals",
},

{
  to: "team",
  icon: <i className="bi bi-diagram-3-fill"></i>,
  label: "My Team",
},

// {
//   to: "wallet",
//   icon: <i className="bi bi-wallet2"></i>,
//   label: "Wallet",
// },

{
  icon: <i className="bi bi-graph-up-arrow"></i>,
  label: "Income",
  children: INCOME_REPORTS.map((report) => ({
    to: report.to,
    icon: <i className={`bi ${report.icon}`}></i>,
    label: report.label,
  })),
},

{
  icon: <i className="bi bi-cash-coin"></i>,
  label: "Fund",
  children: [
    {
      to: "fund/request",
      icon: <i className="bi bi-send-fill"></i>,
      label: "Fund Request",
    },
    {
      to: "fund/report",
      icon: <i className="bi bi-file-earmark-text-fill"></i>,
      label: "Fund  Request Report",
    },
    {
      to: "fund/received",
      icon: <i className="bi bi-box-arrow-in-down"></i>,
      label: "Fund Received Report",
    },
    {
      to: "fund/referral-coins",
      icon: <i className="bi bi-coin"></i>,
      label: "Referral Coins Report",
    },
  ],
},

// {
//   to: "level",
//   icon: <i className="bi bi-trophy-fill"></i>,
//   label: "Levels",
// },

// {
//   to: "pool/level",
//   icon: <i className="bi bi-award-fill"></i>,
//   label: "Pool Levels",
// },

// {
//   to: "leaderboard",
//   icon: <i className="bi bi-bar-chart-fill"></i>,
//   label: "Leaderboard",
// },

// {
//   to: "offers",
//   icon: <i className="bi bi-gift-fill"></i>,
//   label: "Offers",
// },

{
  icon: <i className="bi bi-cash-stack"></i>,
  label: "Withdrawal",
  children: [
    {
      to: "withdraw/request",
      icon: <i className="bi bi-send"></i>,
      label: "Withdrawal Request",
    },
    {
      to: "withdraw/report",
      icon: <i className="bi bi-file-earmark-text"></i>,
      label: "Withdrawal Request Report",
    },
  ],
},



// {
//   to: "support",
//   icon: <i className="bi bi-headset"></i>,
//   label: "Support",
// },


{
  icon: <i className="bi bi-person-gear"></i>,
  label: "Manage Account",
  children: [
    {
      to: "profile",
      icon: <i className="bi bi-person-circle"></i>,
      label: "Profile",
    },
    {
      to: "account/transaction-security",
      icon: <i className="bi bi-key"></i>,
      label: "Transaction Security",
    },
    {
      to: "account/login-security",
      icon: <i className="bi bi-shield-lock"></i>,
      label: "Login Security",
    },
  ],
},

{
  to: "",
  icon: <i className="bi bi-box-arrow-right"></i>,
  label: "Logout",
  onClick: handleLogout
}
];

export default function Header() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState(() => {
    const path = window.location.pathname;
    const open = {};
    if (path.startsWith("/fund")) open.Fund = true;
    if (path.startsWith("/withdraw")) open.Withdrawal = true;
    if (path.startsWith("/reports")) open.Income = true;
    if (path.startsWith("/profile") || path.startsWith("/account")) {
      open["Manage Account"] = true;
    }
    return open;
  });
  const guest = isGuest();
  const guestProfile = guest ? getGuestProfile() : null;

  const hrefFor = (to) => (to.startsWith("/") ? to : `/${to}`);

  const linkActive = (to) => {
    if (!to) return false;
    const windowPath = window.location.pathname.replace(/\/$/, "");
    const linkPath = hrefFor(to).replace(/\/$/, "");
    if (linkPath === "/dashboard") return windowPath === linkPath;
    return windowPath.startsWith(linkPath);
  };

  const renderLink = ({ to, icon, label, onClick }) => {
    const isHash = to === "#";
    const active = !isHash && linkActive(to);
    return (
      <a
        key={label}
        href={isHash || !to ? "#" : hrefFor(to)}
        className={active ? "active" : ""}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
          if (isMobile) setSidebarOpen(false);
        }}
      >
        <span className="ico">{icon}</span>
        {label}
      </a>
    );
  };

  const renderNavLinks = () =>
    NAV_LINKS.map((item) => {
      if (!item.children) return renderLink(item);
      const open = Boolean(openMenus[item.label]);
      return (
        <div className={`nav-group${open ? " open" : ""}`} key={item.label}>
          <button
            type="button"
            className="nav-group-label"
            onClick={() =>
              setOpenMenus((prev) => ({
                ...prev,
                [item.label]: !prev[item.label],
              }))
            }
          >
            <span className="ico">{item.icon}</span>
            {item.label}
            <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          </button>
          {open && (
            <div className="nav-group-links">
              {item.children.map((child) => renderLink(child))}
            </div>
          )}
        </div>
      );
    });

  return (
    <>
      <div className="app ">
       
        <aside
          className={`sidebar${isMobile ? ' mobile' : ''}${isMobile && !sidebarOpen ? ' hidden' : ''}`}
          data-open={isMobile ? (sidebarOpen ? "true" : "false") : undefined}
        >
          {isMobile && (
            <div className="cp-mobile-sidebar-topbar">
              <img className="kk-wordmark" src="/images/logo3.png" alt="KaKowa MChat" />
              <button
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
                className="cp-mobile-sidebar-close"
              >✕</button>
            </div>
          )}

          <div className="brand">
            <img className="kk-wordmark" src="/images/logo3.png" alt="KaKowa MChat" />
          </div>

          {guest && (
            <div className="cp-guest-chip">
              Guest · {guestProfile?.name || "Visitor"}
              <div className="cp-guest-chip-links">
                <a href="/login">Sign in</a>
                <a href="/signup">Register</a>
              </div>
            </div>
          )}

          <nav className="nav">
            {renderNavLinks()}
          </nav>
          <div className="divider" />
          
        </aside>
        {isMobile && (
          <button
            className={`sidebar-toggle${sidebarOpen ? " is-hidden" : ""}`}
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <span aria-hidden>☰</span>
          </button>
        )}
        <main>
          <GuestActionGuard>
            <Outlet />
          </GuestActionGuard>
        </main>
      </div>

      <div className="bottom-nav">
       <div className="bar">
  <a
    className="nav-btn"
    href="/dashboard"
  >
    <span className="ico">
      <i className="bi bi-house-door-fill"></i>
    </span>
    
  </a>

  <a className="nav-btn" href="/fund/request">
    <span className="ico">
      <i className="bi bi-box-seam-fill"></i>
    </span>
  </a>

  <a className="nav-btn" href="/wallet">
    <span className="ico">
      <i className="bi bi-coin"></i>
    </span>
    
  </a>

  <button
    type="button"
    className="nav-btn"
    aria-label="Open menu"
    onClick={() => setSidebarOpen(true)}
  >
    <span className="ico">
      <i className="bi bi-list"></i>
    </span>
  </button>
</div>
      </div>
    </>
  );
}
