import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
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
  localStorage.removeItem("admin_token");
  localStorage.removeItem("refreshToken"); // if you use refresh tokens
  sessionStorage.removeItem("admin_token ");
  window.location.href = "/";
}

const NAV_LINKS = [
  {
    to: "admin/dashboard",
    icon: <i className="bi bi-grid-1x2-fill"></i>,
    label: "Dashboard",
  },
  {
    to: "admin/bankDetail",
    icon: <i className="bi bi-bank"></i>,
    label: "Bank Detail",
  },
  {
    to: "admin/payment-history",
    icon: <i className="bi bi-receipt"></i>,
    label: "Payment History",
  },
  {
    to: "admin/add-fund",
    icon: <i className="bi bi-coin"></i>,
    label: "Add Fund",
  },
  {
    to: "admin/plan-requests",
    icon: <i className="bi bi-lightning-charge-fill"></i>,
    label: "Plan Requests",
  },
  {
    to: "admin/host-requests",
    icon: <i className="bi bi-broadcast"></i>,
    label: "Host Requests",
  },

  {
    to: "admin/users",
    icon: <i className="bi bi-person-circle"></i>,
    label: "All Users",
  },

  {
    to: "admin/stickers",
    icon: <i className="bi bi-box-seam-fill"></i>,
    label: "Stickers",
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
  const hrefFor = (to) => (to.startsWith("/") ? to : `/${to}`);
  // Navigation rendering
  const renderNavLinks = () =>
    NAV_LINKS.map(({ to, icon, label, onClick }) => {
      const isHash = to === "#";
      let active = false;
      if (!isHash) {
        const windowPath = window.location.pathname.replace(/\/$/, "");
        const linkPath = hrefFor(to).replace(/\/$/, "");
        if (linkPath === "/dashboard") {
          active = windowPath === linkPath;
        } else {
          active = windowPath.startsWith(linkPath);
        }
      }

      return (
        <a
          key={label}
          href={isHash ? "#" : hrefFor(to)}
          className={active ? "active" : ""}
          onClick={(e) => {
            if (onClick) {
              e.preventDefault();
              onClick();
            }
            if (isMobile) {
              setSidebarOpen(false);
            }
          }}
        >
          <span className="ico">{icon}</span>
          {label}
        </a>
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
            <div
              className="cp-mobile-sidebar-topbar"
            >
              <img src="/images/salesgrow.png" alt="SalesGrow" />
              <button
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
                className="cp-mobile-sidebar-close"
              >✕</button>
            </div>
          )}
          <div className="brand">
            <img src="/images/salesgrow.png" alt="SalesGrow" />
          </div>
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
          <Outlet />
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

          <a className="nav-btn" href="/admin/users">
            <span className="ico">
              <i className="bi bi-people-fill"></i>
            </span>

          </a>

          <a className="nav-btn" href="/wallet">
            <span className="ico">
              <i className="bi bi-coin"></i>
            </span>

          </a>

          <a
            className="nav-btn"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="ico">
              <i class="bi bi-list"></i>
            </span>

          </a>
        </div>
      </div>
    </>
  );
}
