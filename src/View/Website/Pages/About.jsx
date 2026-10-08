import React from "react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* HERO SECTION */}
      <section
        style={{
          background:
            "linear-gradient(to right, #0f172a, #1e293b, #334155)",
          color: "#fff",
          padding: "120px 0",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1
                style={{
                  fontSize: "60px",
                  fontWeight: "700",
                  marginBottom: "25px",
                }}
              >
                About ChatProX
              </h1>

              <p
                style={{
                  fontSize: "20px",
                  lineHeight: "35px",
                  marginBottom: "30px",
                }}
              >
                ChatProX is a next-generation social chatting platform where
                users can make online friends, connect with people worldwide,
                become live hosts, and build income through chatting, live
                interaction, and referrals.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to="/signup"
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    padding: "15px 35px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                >
                  Join Now
                </Link>

                <Link
                  to="/contact"
                  style={{
                    background: "#fff",
                    color: "#111",
                    padding: "15px 35px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                >
                  Contact Us
                </Link>
              </div>
            </div>

            <div className="col-lg-6 text-center">
              <img
                src="/images/about-chat.png"
                alt="about"
                style={{
                  width: "100%",
                  maxWidth: "500px",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        style={{
          padding: "100px 0",
          background: "#f8fafc",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <h2
              style={{
                fontSize: "45px",
                fontWeight: "700",
                marginBottom: "20px",
                color: "black",
           
              }}
            >
              What You Can Do on ChatProX
            </h2>

            <p
              style={{
                maxWidth: "700px",
                margin: "0 auto",
                color: "#555",
                lineHeight: "30px",
              }}
            >
              ChatProX helps users connect socially while creating earning
              opportunities through live hosting, referrals, and engagement.
            </p>
          </div>

          <div className="row g-4">
            {/* CARD */}
            {[
              {
                icon: "bi-chat-dots-fill",
                title: "Find Online Friends",
                desc: "Meet new people worldwide, build friendships, and enjoy real-time conversations.",
              },
              {
                icon: "bi-camera-video-fill",
                title: "Become a Live Host",
                desc: "Start live chatting sessions, grow followers, and engage with your audience.",
              },
              {
                icon: "bi-cash-stack",
                title: "Earn Through Live Chat",
                desc: "Hosts can generate income through gifts, interactions, and premium live sessions.",
              },
              {
                icon: "bi-diagram-3-fill",
                title: "Referral Income",
                desc: "Invite users using your referral link and grow your passive income network.",
              },
              {
                icon: "bi-trophy-fill",
                title: "Level & Rewards System",
                desc: "Unlock higher income levels and rewards as your network and activity grow.",
              },
              {
                icon: "bi-shield-check",
                title: "Safe & Secure",
                desc: "Enjoy a secure chatting experience with privacy and account protection.",
              },
            ].map((item, index) => (
              <div className="col-lg-4 col-md-6" key={index}>
                <div
                  style={{
                    background: "#fff",
                    padding: "40px 30px",
                    borderRadius: "20px",
                    height: "100%",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                    transition: "0.3s",
                  }}
                >
                  <div
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      background: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "25px",
                    }}
                  >
                    <i
                      className={`bi ${item.icon}`}
                      style={{
                        color: "#fff",
                        fontSize: "30px",
                      }}
                    ></i>
                  </div>

                  <h4
                    style={{
                      fontWeight: "700",
                      marginBottom: "15px",
                    }}
                  >
                    {item.title}
                  </h4>

                  <p
                    style={{
                      color: "#666",
                      lineHeight: "28px",
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

      {/* HOW IT WORKS */}
      <section
        style={{
          padding: "100px 0",
        }}
      >
        <div className="container">
          <div className="text-center mb-5">
            <h2
              style={{
                fontSize: "45px",
                fontWeight: "700",
                marginBottom: "20px",
              }}
            >
              How ChatProX Works
            </h2>
          </div>

          <div className="row g-4">
            {[
              {
                step: "01",
                title: "Create Your Account",
                desc: "Sign up and complete your profile to start connecting.",
              },
              {
                step: "02",
                title: "Make Friends & Chat",
                desc: "Send messages, interact with users, and grow your social circle.",
              },
              {
                step: "03",
                title: "Become a Host",
                desc: "Go live and interact with followers through live chat sessions.",
              },
              {
                step: "04",
                title: "Earn Income",
                desc: "Receive rewards, referral bonuses, and live interaction earnings.",
              },
            ].map((item, index) => (
              <div className="col-lg-3 col-md-6" key={index}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 25px",
                    border: "1px solid #eee",
                    borderRadius: "20px",
                    height: "100%",
                  }}
                >
                  <h1
                    style={{
                      fontSize: "70px",
                      color: "#2563eb",
                      fontWeight: "800",
                    }}
                  >
                    {item.step}
                  </h1>

                  <h4
                    style={{
                      marginTop: "20px",
                      marginBottom: "15px",
                      fontWeight: "700",
                    }}
                  >
                    {item.title}
                  </h4>

                  <p
                    style={{
                      color: "#666",
                      lineHeight: "28px",
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

      {/* CTA */}
      <section
        style={{
          background: "#0f172a",
          color: "#fff",
          padding: "100px 0",
          textAlign: "center",
        }}
      >
        <div className="container">
          <h2
            style={{
              fontSize: "50px",
              fontWeight: "700",
              marginBottom: "25px",
            }}
          >
            Start Your Chat & Earning Journey Today
          </h2>

          <p
            style={{
              maxWidth: "700px",
              margin: "0 auto 40px",
              lineHeight: "32px",
              fontSize: "18px",
            }}
          >
            Join thousands of users on ChatProX who are making friends,
            becoming hosts, and building income online.
          </p>

          <Link
            to="/signup"
            style={{
              background: "#2563eb",
              color: "#fff",
              padding: "18px 40px",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "18px",
            }}
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;