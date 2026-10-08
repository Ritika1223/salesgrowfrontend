import React from "react";
import { Link } from "react-router-dom";

const IncomePage = () => {
  return (
    <div
      style={{
        background: "#07011b",
        color: "#fff",
      }}
    >
      {/* HERO */}
      <section
        style={{
          padding: "120px 0",
          background:
            "linear-gradient(to right, #1a0033, #2b0057, #110022)",
        }}
      >
        <div className="container text-center">
          <h1
            style={{
              fontSize: "65px",
              fontWeight: "800",
              marginBottom: "20px",
              color: "#fff",
            }}
          >
            ChatProX Income System
          </h1>

          <p
            style={{
              maxWidth: "850px",
              margin: "0 auto",
              fontSize: "20px",
              lineHeight: "38px",
              color: "#ddd",
            }}
          >
            Build friendships, become a host, grow your referral network, and
            unlock multiple income streams with ChatProX. The more active you
            are, the bigger your earnings become.
          </p>
        </div>
      </section>

      {/* INCOME TYPES */}
      <section
        style={{
          padding: "100px 0",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <h2
              style={{
                fontSize: "50px",
                fontWeight: "700",
              }}
            >
              Types of Income
            </h2>

            <p
              style={{
                color: "#bbb",
                marginTop: "20px",
                fontSize: "18px",
              }}
            >
              Multiple ways to earn and grow on ChatProX
            </p>
          </div>

          <div className="row g-4">
            {[
              {
                title: "Self Income",
                percent: "36%",
                icon: "bi-wallet2",
                desc: "Earn income directly from your own activity, chatting, hosting, engagement, and platform participation.",
              },
              {
                title: "Direct Referral Income",
                percent: "12%",
                icon: "bi-people-fill",
                desc: "Invite friends using your referral link and receive rewards whenever they join and stay active.",
              },
              {
                title: "Level Income",
                percent: "10%",
                icon: "bi-diagram-3-fill",
                desc: "Earn team-based level income from your growing network up to 14 levels deep.",
              },
              {
                title: "Pool Income",
                percent: "12%",
                icon: "bi-bar-chart-fill",
                desc: "Achieve higher pool ranks by completing direct targets and unlock extra bonus income.",
              },
              {
                title: "Rank Rewards",
                percent: "4%",
                icon: "bi-trophy-fill",
                desc: "Complete activity milestones and unlock special rank bonuses and reward percentages.",
              },
              {
                title: "VIP Club Income",
                percent: "9%",
                icon: "bi-gem",
                desc: "Exclusive VIP members receive premium income benefits, higher bonuses, and special rewards.",
              },
            ].map((item, index) => (
              <div className="col-lg-4 col-md-6" key={index}>
                <div
                  style={{
                    background:
                      "linear-gradient(145deg,#1c0038,#2a0050,#140027)",
                    borderRadius: "25px",
                    padding: "40px 30px",
                    height: "100%",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "#ffcc00",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "25px",
                    }}
                  >
                    <i
                      className={`bi ${item.icon}`}
                      style={{
                        color: "#000",
                        fontSize: "35px",
                      }}
                    ></i>
                  </div>

                  <h3
                    style={{
                      fontWeight: "700",
                      marginBottom: "10px",
                    }}
                  >
                    {item.title}
                  </h3>

                  <h1
                    style={{
                      color: "#ffcc00",
                      fontWeight: "800",
                      marginBottom: "20px",
                    }}
                  >
                    {item.percent}
                  </h1>

                  <p
                    style={{
                      color: "#ddd",
                      lineHeight: "30px",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

 {/* HOST */}
 <section
        style={{
          padding: "100px 0",
          background:
            "linear-gradient(to right, #1a0033, #2b0057, #110022)",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1
                style={{
                  fontSize: "55px",
                  fontWeight: "800",
                  marginBottom: "25px",
                }}
              >
                Become a Host
              </h1>

              <p
                style={{
                  color: "#ddd",
                  lineHeight: "35px",
                  fontSize: "18px",
                }}
              >
                Turn your free time into a real earning opportunity. Become a
                live host, connect with users, receive gifts, and build your
                audience while earning daily rewards.
              </p>

              <div
                style={{
                  marginTop: "40px",
                }}
              >
                {[
                  "Receive gifts from user coins",
                  "Convert coins into real income",
                  "More engagement = Higher earnings",
                  "Top hosts receive extra bonuses",
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        width: "45px",
                        height: "45px",
                        borderRadius: "50%",
                        background: "#ffcc00",
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                      }}
                    >
                      ✓
                    </div>

                    <h5
                      style={{
                        margin: 0,
                      }}
                    >
                      {item}
                    </h5>
                  </div>
                ))}
              </div>

              <Link
                to="/signup"
                style={{
                  display: "inline-block",
                  marginTop: "30px",
                  background: "#ffcc00",
                  color: "#000",
                  padding: "18px 40px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: "700",
                  fontSize: "18px",
                }}
              >
                Start Hosting Today
              </Link>
            </div>

            <div className="col-lg-6 text-center">
              <img
                src="/images/host-income.png"
                alt="host"
                style={{
                  width: "100%",
                  maxWidth: "550px",
                }}
              />
            </div>
          </div>
        </div>
      </section>
      {/* LEVEL INCOME */}
      {/* <section
        style={{
          padding: "100px 0",
          background: "#120024",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <h2
              style={{
                fontSize: "50px",
                fontWeight: "700",
              }}
            >
              Level Income System
            </h2>

            <p
              style={{
                color: "#bbb",
                marginTop: "20px",
                fontSize: "18px",
              }}
            >
              Grow your team and unlock deeper earning levels
            </p>
          </div>

          <div className="table-responsive">
            <table
              className="table"
              style={{
                color: "#fff",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <thead
                style={{
                  background: "#7e22ce",
                }}
              >
                <tr>
                  <th>Level</th>
                  <th>Income</th>
                  <th>Requirement</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {[
                  {
                    level: "1st Level",
                    income: "15%",
                    req: "1 Direct",
                    desc: "Start earning from your first referred user.",
                  },
                  {
                    level: "2nd Level",
                    income: "10%",
                    req: "1 Direct",
                    desc: "Earn from the network growth of your team.",
                  },
                  {
                    level: "3rd Level",
                    income: "5%",
                    req: "1 Direct",
                    desc: "Continue earning as your community expands.",
                  },
                  {
                    level: "4th Level",
                    income: "2%",
                    req: "1 Direct",
                    desc: "Receive passive earnings from deeper referrals.",
                  },
                  {
                    level: "5th Level",
                    income: "1%",
                    req: "1 Direct",
                    desc: "Additional team performance rewards.",
                  },
                  {
                    level: "6th - 10th",
                    income: "0.2%",
                    req: "2 Direct",
                    desc: "Unlock more levels with stronger referrals.",
                  },
                  {
                    level: "11th - 14th",
                    income: "0.1%",
                    req: "2 Direct",
                    desc: "Long-term passive network earning system.",
                  },
                ].map((item, index) => (
                  <tr key={index}>
                    <td>{item.level}</td>
                    <td>{item.income}</td>
                    <td>{item.req}</td>
                    <td>{item.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section> */}

      {/* POOL LEVELS */}
      <section
        style={{
          padding: "100px 0",
        }}
      >
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6">
              <div
                style={{
                  background:
                    "linear-gradient(145deg,#1c0038,#2a0050,#140027)",
                  borderRadius: "25px",
                  padding: "50px",
                  height: "100%",
                }}
              >
                <h2
                  style={{
                    fontWeight: "700",
                    marginBottom: "30px",
                  }}
                >
                  Pool Progression
                </h2>

                {[
                  "Starter → 10 Directs",
                  "Active → 20 Directs",
                  "Growth → 50 Directs",
                  "Leader → 100 Directs",
                  "Crown → 200 Directs",
                  "King → 500 Directs",
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "18px 25px",
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      marginBottom: "20px",
                      fontSize: "20px",
                      fontWeight: "600",
                    }}
                  >
                    {item}
                  </div>
                ))}

                <p
                  style={{
                    color: "#ccc",
                    lineHeight: "32px",
                    marginTop: "30px",
                  }}
                >
                  The more direct referrals you build, the higher your pool
                  level becomes, unlocking larger team income rewards.
                </p>
              </div>
            </div>

            {/* RANK REWARDS */}
            <div className="col-lg-6">
              <div
                style={{
                  background:
                    "linear-gradient(145deg,#1c0038,#2a0050,#140027)",
                  borderRadius: "25px",
                  padding: "50px",
                  height: "100%",
                }}
              >
                <h2
                  style={{
                    fontWeight: "700",
                    marginBottom: "30px",
                  }}
                >
                  Rank Rewards
                </h2>

                {[
                  {
                    title: "Go Chat",
                    desc: "1% Bonus + 5 Days Active",
                  },
                  {
                    title: "Chat Pro",
                    desc: "1% Bonus + 10 Days Active as Host",
                  },
                  {
                    title: "Chat Pro X",
                    desc: "1% Bonus + 20 Days Active",
                  },
                  {
                    title: "Super Chat Pro X",
                    desc: "1% Bonus + 25 Days Active",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      padding: "25px",
                      borderRadius: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    <h4
                      style={{
                        color: "#ffcc00",
                        marginBottom: "10px",
                        fontWeight: "700",
                      }}
                    >
                      🏆 {item.title}
                    </h4>

                    <p
                      style={{
                        color: "#ddd",
                        margin: 0,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                ))}

                <p
                  style={{
                    color: "#ccc",
                    lineHeight: "32px",
                    marginTop: "30px",
                  }}
                >
                  Stay active consistently and unlock premium reward bonuses,
                  higher rank status, and exclusive earning opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default IncomePage;