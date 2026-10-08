// ==========================
// POOL INCOME PAGE
// ==========================

import React from "react";

const PoolIncomePage = () => {
  const pools = [
    {
      pool: "Starter Pool",
      directs: 10,
      percentage: "2%",
      bonus: 1000,
      achieved: true,
    },
    {
      pool: "Active Pool",
      directs: 20,
      percentage: "3%",
      bonus: 2500,
      achieved: true,
    },
    {
      pool: "Growth Pool",
      directs: 50,
      percentage: "5%",
      bonus: 5000,
      achieved: false,
    },
    {
      pool: "Leader Pool",
      directs: 100,
      percentage: "7%",
      bonus: 10000,
      achieved: false,
    },
  ];

  return (
    <div
      style={{
        background: "#07011b",
        minHeight: "100vh",
        color: "#fff",
        padding: "40px 20px",
      }}
    >
      <div className="container">
        {/* TITLE */}
        <div className="mb-5">
          <h1
            style={{
              fontSize: "45px",
              fontWeight: "800",
            }}
          >
            Pool Income Report
          </h1>

          <p
            style={{
              color: "#bbb",
              marginTop: "10px",
            }}
          >
            Track your pool achievements, bonus rewards,
            and pool income percentages based on your plan
            and referral targets.
          </p>
        </div>

        {/* SUMMARY */}
        <div className="row g-4 mb-5">
          {[
            {
              title: "Current Pool",
              value: "Active Pool",
              icon: "bi-award-fill",
            },
            {
              title: "Total Pool Bonus",
              value: "₹ 3,500",
              icon: "bi-cash-stack",
            },
            {
              title: "Direct Referrals",
              value: "22 Users",
              icon: "bi-people-fill",
            },
            {
              title: "Next Target",
              value: "50 Directs",
              icon: "bi-graph-up-arrow",
            },
          ].map((item, index) => (
            <div className="col-lg-3 col-md-6" key={index}>
              <div
                style={{
                  background:
                    "linear-gradient(145deg,#1a0033,#2a0050,#120024)",
                  padding: "30px",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "65px",
                    height: "65px",
                    borderRadius: "50%",
                    background: "#ffcc00",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <i
                    className={`bi ${item.icon}`}
                    style={{
                      color: "#000",
                      fontSize: "28px",
                    }}
                  ></i>
                </div>

                <h5
                  style={{
                    color: "#bbb",
                  }}
                >
                  {item.title}
                </h5>

                <h2
                  style={{
                    fontWeight: "800",
                    marginTop: "10px",
                  }}
                >
                  {item.value}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* POOL TABLE */}
        <div
          style={{
            background:
              "linear-gradient(145deg,#1a0033,#2a0050,#120024)",
            padding: "35px",
            borderRadius: "25px",
          }}
        >
         


          {/* NOTE */}
          <div
            style={{
              marginTop: "35px",
              background: "rgba(255,255,255,0.05)",
              padding: "25px",
              borderRadius: "15px",
            }}
          >
            <h4
              style={{
                color: "#ffcc00",
                marginBottom: "15px",
              }}
            >
              Pool Income Information
            </h4>

            <p
              style={{
                color: "#ccc",
                lineHeight: "30px",
                margin: 0,
              }}
            >
              Pool bonuses are automatically added to your wallet
              after completing the required referral target.
              Income percentage depends on your active plan
              and unlocked pool level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolIncomePage;