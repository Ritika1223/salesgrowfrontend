export const PLAN_META = {
  BASIC: {
    key: "BASIC",
    label: "Starter",
    image: "/images/royal.png",
    ring: "/images/royal2.png",
    price: 590,
  },
  STANDARD: {
    key: "STANDARD",
    label: "Royal",
    image: "/images/starter.png",
    ring: "/images/starter2.png",
    price: 1180,
  },
  PREMIUM: {
    key: "PREMIUM",
    label: "Premium",
    image: "/images/premium.png",
    ring: "/images/premium2.png",
    price: 5900,
  },
};

export function getPlanMeta(plan) {
  const key = String(plan || "").trim().toUpperCase();
  return PLAN_META[key] || null;
}

/** $50–$249.99 = 1st, $250–$999.99 = 2nd, $1000+ = 3rd. */
export function crownForAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 50) return null;
  if (value < 250) {
    return { level: 1, label: "1st Crown", ring: "/images/starter2.png" };
  }
  if (value < 1000) {
    return { level: 2, label: "2nd Crown", ring: "/images/royal2.png" };
  }
  return { level: 3, label: "3rd Crown", ring: "/images/premium2.png" };
}

function ringImage(src) {
  return (
    <img
      src={src}
      alt=""
      className="plan-dp-ring"
      onError={(e) => {
        const spaced = String(src).replace(/(\w+)2\.png$/i, "$1 2.png");
        if (e.currentTarget.src.indexOf(spaced) === -1 && !e.currentTarget.dataset.tried) {
          e.currentTarget.dataset.tried = "1";
          e.currentTarget.src = spaced;
        }
      }}
    />
  );
}

export function PlanDpRing({ plan, planAmount, className = "", overlay = null, children }) {
  const crown = crownForAmount(planAmount);
  const meta = crown || getPlanMeta(plan);
  const ring = crown?.ring || meta?.ring;
  return (
    <div className={`plan-dp-wrap ${ring ? "has-plan-ring" : ""} ${className}`.trim()}>
      <div className="plan-dp-inner">{children}</div>
      {ring ? ringImage(ring) : null}
      {overlay}
    </div>
  );
}

export function PlanCrownBadge({ planAmount, className = "" }) {
  const crown = crownForAmount(planAmount);
  if (!crown) return null;
  return (
    <span className={`cp-disc-crown ${className}`.trim()} title={crown.label}>
      <img src={crown.ring} alt="" />
      <span>{crown.label}</span>
    </span>
  );
}

export function PlanCrownWithPrice({ plan, planAmount, isActive, className = "" }) {
  const crown = crownForAmount(planAmount);
  const amount = Number(planAmount);
  if (crown) {
    return (
      <span className={`plan-crown-with-price ${className}`.trim()}>
        <img src={crown.ring} alt="" className="plan-crown-inline" />
        <span className="plan-crown-name">{crown.label}</span>
        <span className="plan-crown-price">
          ${amount.toLocaleString("en-US")}
        </span>
      </span>
    );
  }

  const meta = getPlanMeta(plan);
  if (meta) {
    return (
      <span className={`plan-crown-with-price ${className}`.trim()}>
        <img src={meta.ring} alt="" className="plan-crown-inline" />
        <span className="plan-crown-name">{meta.label}</span>
        <span className="plan-crown-price">
          ₹{Number(meta.price).toLocaleString("en-IN")}
        </span>
      </span>
    );
  }

  const fundActive = Boolean(isActive) || String(plan || "").toUpperCase() === "INVEST";
  if (fundActive && Number.isFinite(amount) && amount > 0) {
    return (
      <span className={`plan-crown-with-price ${className}`.trim()}>
        <span className="plan-crown-name">Active</span>
        <span className="plan-crown-price">
          ${amount.toLocaleString("en-US")}
        </span>
      </span>
    );
  }

  return <span className={className}>No Active Plan</span>;
}
