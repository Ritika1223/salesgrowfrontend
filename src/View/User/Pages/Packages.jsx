import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../../config/api";
import {
  getToken,
  resolveAuthUserId,
  authJsonHeaders,
  getStoredAuthUser,
  mergeStoredAuthUser,
} from "../../../utils/auth";
import { toast } from "react-toastify";
import ActivatePlanModal from "../Componets/ActivatePlanModal";

const PLANS_API = `${API_BASE}/plans`;

export default function Packages() {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userId] = useState(resolveAuthUserId());
  const [isActive, setIsActive] = useState(
    () => Boolean(getStoredAuthUser()?.isActive)
  );
  const [activePlan, setActivePlan] = useState(
    () => getStoredAuthUser()?.plan || ""
  );
  const [pendingPlan, setPendingPlan] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    let mounted = true;

    axios
      .get(PLANS_API)
      .then((res) => {
        if (!mounted) return;
        setPlans(Array.isArray(res.data?.plans) ? res.data.plans : []);
      })
      .catch((err) => {
        if (!mounted) return;
        setPlansError(err?.response?.data?.message || "Could not load plans");
      })
      .finally(() => {
        if (mounted) setLoadingPlans(false);
      });

    const token = getToken();
    if (token) {
      axios
        .get(`${API_BASE}/auth/user/me`, { headers: authJsonHeaders() })
        .then((res) => {
          if (!mounted) return;
          const u = res.data?.user;
          setIsActive(Boolean(u?.isActive));
          setActivePlan(u?.plan || "");
          mergeStoredAuthUser({
            isActive: Boolean(u?.isActive),
            plan: u?.plan || "",
            hostApproved: Boolean(u?.hostApproved) || Boolean(u?.isActive),
          });
        })
        .catch(() => {});

      axios
        .get(`${PLANS_API}/plan-request/me`, { headers: authJsonHeaders() })
        .then((res) => {
          if (!mounted) return;
          const latest = res.data?.data;
          if (latest?.status === "pending") {
            setPendingPlan(latest.planName || "");
          }
        })
        .catch(() => {});
    }

    return () => {
      mounted = false;
    };
  }, []);

  function handleActivateClick(plan) {
    if (!getToken()) {
      setError("Please login first");
      return;
    }
    if (!userId) {
      setError("Could not resolve logged user");
      return;
    }
    if (isActive) {
      toast.info(`You already have an active ${activePlan || "plan"}.`);
      return;
    }
    if (pendingPlan) {
      toast.info(
        `Your ${pendingPlan} request is pending. Admin typically confirms within 20 minutes.`
      );
      return;
    }
    setError("");
    setMessage("");
    setSelectedPlan(plan);
  }

  return (
    <div className="modern-plans-page">
      <div className="container-fluid">
        <div className="prox-live-navbar">
          <div className="prox-live-navbar-left">
            <div className="prox-live-logo">
              <i className="bi bi-stars"></i>
            </div>
            <div>
              <h2 className="prox-live-navbar-title">Subscription</h2>
              <p className="prox-live-navbar-subtitle">
                Choose a plan to start your income
              </p>
            </div>
          </div>
          <div className="prox-live-navbar-right">
            <button className="prox-live-gradient-btn">
              <i className="bi bi-lightning-charge-fill"></i>
              {loadingPlans
                ? "Loading..."
                : isActive
                  ? `${activePlan || "Plan"} Active`
                  : `${plans.length} Active Plans`}
            </button>
          </div>
        </div>

        {plansError && (
          <div className="modern-alert modern-alert-error">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{plansError}</span>
          </div>
        )}

        {message && (
          <div className="modern-alert modern-alert-success">
            <i className="bi bi-check-circle-fill"></i>
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="modern-alert modern-alert-error">
            <i className="bi bi-x-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        {loadingPlans && (
          <div className="modern-plan-loader">
            <div className="spinner-border text-light"></div>
            <p>Loading premium plans...</p>
          </div>
        )}

        {!loadingPlans && (
          <div className="row g-4">
            {plans.map((plan) => {
              const name = String(plan.name || "");
              const popular = name === "STANDARD";
              const isCurrent = isActive && String(activePlan) === name;
              const isPending = pendingPlan === name;

              return (
                <div className="col-xl-4 col-md-6" key={name}>
                  <div
                    className={`modern-plan-card ${
                      popular || isCurrent ? "active-plan" : ""
                    }`}
                  >
                    {popular && (
                      <div className="modern-popular-badge">
                        <i className="bi bi-fire"></i>
                        Most Popular
                      </div>
                    )}

                    <div className="modern-plan-icon">
                      <i
                        className={`bi ${
                          name === "BASIC"
                            ? "bi-gem"
                            : name === "STANDARD"
                              ? "bi-lightning-charge-fill"
                              : name === "PREMIUM"
                                ? "bi-trophy-fill"
                                : "bi-stars"
                        }`}
                      ></i>
                    </div>

                    <div className="modern-plan-title">
                      <h2>{name}</h2>
                      <p>Subscribe once to start your income</p>
                    </div>

                    <div className="modern-price-box">
                      <div className="price-left">
                        <span className="currency">₹</span>
                        <span className="price">
                          {Number(plan.price || 0).toLocaleString()}
                        </span>
                      </div>
                      <span className="monthly-tag">One Time</span>
                    </div>

                    <ul className="modern-plan-perks">
                      <li>
                        <i className="bi bi-check-circle"></i> Starts self, direct, and level income
                      </li>
                      <li>
                        <i className="bi bi-check-circle"></i> Pool, rank, and VIP income from this plan
                      </li>
                    </ul>

                    <button
                      onClick={() => handleActivateClick(plan)}
                      disabled={isActive}
                      className={`modern-buy-btn ${popular ? "active-btn" : ""}`}
                    >
                      {isCurrent ? (
                        <>
                          <i className="bi bi-check-circle-fill"></i>
                          Current Plan
                        </>
                      ) : isActive ? (
                        <>
                          <i className="bi bi-lock-fill"></i>
                          Plan Already Active
                        </>
                      ) : isPending ? (
                        <>
                          <i className="bi bi-hourglass-split"></i>
                          Pending Approval
                        </>
                      ) : (
                        <>
                          <i className="bi bi-lightning-charge-fill"></i>
                          Activate Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ActivatePlanModal
        open={Boolean(selectedPlan)}
        planName={selectedPlan?.name || ""}
        amount={Number(selectedPlan?.price || 0)}
        onClose={() => setSelectedPlan(null)}
        onSubmitted={() => {
          setPendingPlan(selectedPlan?.name || "");
          setMessage(
            "Request sent. Admin will verify payment and activate your plan."
          );
        }}
      />
    </div>
  );
}
