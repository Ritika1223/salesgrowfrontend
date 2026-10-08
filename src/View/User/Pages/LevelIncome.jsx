// ==========================
// LEVEL INCOME PAGE
// ==========================

import React from "react";
import PoolIncomePage from "./PoolIncome";

const LevelIncomePage = () => {
  const levels = [
    {
      level: 1,
      percentage: "15%",
      required: 1,
      achieved: true,
      users: 5,
      income: 5200,
    },
    {
      level: 2,
      percentage: "10%",
      required: 1,
      achieved: true,
      users: 12,
      income: 3400,
    },
    {
      level: 3,
      percentage: "5%",
      required: 1,
      achieved: true,
      users: 25,
      income: 1800,
    },
    {
      level: 4,
      percentage: "2%",
      required: 2,
      achieved: false,
      users: 0,
      income: 0,
    },
    {
      level: 5,
      percentage: "1%",
      required: 2,
      achieved: false,
      users: 0,
      income: 0,
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
            Level Income Report
          </h1>

          <p
            style={{
              color: "#bbb",
              marginTop: "10px",
            }}
          >
            Track your level progress, direct referrals, unlocked levels,
            and earnings from your team network.
          </p>
        </div>

        {/* SUMMARY */}
        <div className="row g-4 mb-5">
          {[
            {
              title: "Current Active Level",
              value: "Level 3",
              icon: "bi-layers-fill",
            },
            {
              title: "Total Direct Referrals",
              value: "18 Users",
              icon: "bi-people-fill",
            },
            {
              title: "Total Level Income",
              value: "₹ 10,400",
              icon: "bi-wallet2",
            },
            {
              title: "Unlocked Levels",
              value: "3 / 14",
              icon: "bi-unlock-fill",
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

       
<PoolIncomePage/>
        
      </div>
    </div>
  );
};

export default LevelIncomePage;