export const PLAN_META = {
  BASIC: {
    key: "BASIC",
    label: "Starter",
    image: "/images/starter.png",
    ring: "/images/starter2.png",
    price: 590,
  },
  STANDARD: {
    key: "STANDARD",
    label: "Royal",
    image: "/images/royal.png",
    ring: "/images/royal2.png",
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

export function PlanDpRing({ plan, className = "", overlay = null, children }) {
  const meta = getPlanMeta(plan);
  return (
    <div className={`plan-dp-wrap ${meta ? "has-plan-ring" : ""} ${className}`.trim()}>
      <div className="plan-dp-inner">{children}</div>
      {meta ? (
        <img
          src={meta.ring}
          alt=""
          className="plan-dp-ring"
          onError={(e) => {
            const spaced = meta.ring.replace(/(\w+)2\.png$/i, "$1 2.png");
            if (e.currentTarget.src !== spaced && !e.currentTarget.dataset.tried) {
              e.currentTarget.dataset.tried = "1";
              e.currentTarget.src = spaced;
            }
          }}
        />
      ) : null}
      {overlay}
    </div>
  );
}

export function PlanCrownWithPrice({ plan, className = "" }) {
  const meta = getPlanMeta(plan);
  if (!meta) return <span className={className}>No Active Plan</span>;
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
