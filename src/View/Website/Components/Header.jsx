import React from "react";
import { Link } from "react-router-dom";

const HeaderPage = () => {
  return (
    <>

           <header className="header-section">
        <div className="header-top">
          <div className="container">
            <div className="header-top-area">

              <ul className="left">
                <li>
                  <i className="bi bi-telephone-fill"></i>
                  <span> +800-123-4567 6587</span>
                </li>
                <li>
                  <i className="bi bi-geo-alt-fill"></i>
                  Beverley, New York 224 USA
                </li>
              </ul>

              <ul className="social-icons d-flex align-items-center">
                <li><p>Find us on :</p></li>

                <li>
                  <a href="#" className="fb">
                    <i className="bi bi-messenger"></i>
                  </a>
                </li>

                <li>
                  <a href="#" className="twitter">
                    <i className="bi bi-twitter"></i>
                  </a>
                </li>

                <li>
                  <a href="#" className="vimeo">
                    <i className="bi bi-camera-video-fill"></i>
                  </a>
                </li>

                <li>
                  <a href="#" className="skype">
                    <i className="bi bi-skype"></i>
                  </a>
                </li>

                <li>
                  <a href="#" className="rss">
                    <i className="bi bi-rss-fill"></i>
                  </a>
                </li>
              </ul>

            </div>
          </div>
        </div>


        <div className="header-bottom">
          <div className="container">
            <div className="header-wrapper">

              <div className="logo">
                <Link to="/">MLM Project</Link>
              </div>

              <div className="menu-area">
                <ul className="menu">

                  <li><Link to="/" className="active">Home</Link></li>

                  <li className="menu-item-has-children">
                    <a href="#">Features</a>
                    <ul className="submenu">
                      <li><Link to="/">All Members</Link></li>
                      <li><Link to="/">Member Profile</Link></li>
                      <li><Link to="/">Login</Link></li>
                      <li><Link to="/">Sign Up</Link></li>
                      <li><Link to="/">Pricing Plan</Link></li>
                      <li><Link to="/">404 Page</Link></li>
                    </ul>
                  </li>

                  <li><Link to="/community">Community</Link></li>

                  <li className="menu-item-has-children">
                    <a href="#">Blog</a>
                    <ul className="submenu">
                      <li><Link to="/blog">Blog</Link></li>
                      <li><Link to="/blog-single">Blog Single</Link></li>
                    </ul>
                  </li>

                  <li><Link to="/contact">Contact</Link></li>
                </ul>

                <Link className="login" to="/login">
                  <i className="bi bi-person-fill"></i> <span>LOG IN</span>
                </Link>

                <Link className="signup" to="/signup">
                  <i className="bi bi-people-fill"></i> <span>SIGN UP</span>
                </Link>

                {/* MOBILE */}
                <div className="header-bar d-lg-none">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="ellepsis-bar d-lg-none">
                  <i className="bi bi-info-square-fill"></i>
                </div>

              </div>
            </div>
          </div>
        </div>
      </header>

    </>
  );
};

export default HeaderPage;