import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
         <footer className="footer-section">
        <div className="footer-top">
          <div className="container">
            <div className="row g-3 justify-content-center g-lg-0">

              {/* Phone */}
              <div className="col-lg-4 col-sm-6 col-12">
                <div className="footer-top-item lab-item">
                  <div className="lab-inner d-flex align-items-center">
                    <div className="lab-thumb me-2">
                      <i className="bi bi-telephone-fill fs-4"></i>
                    </div>
                    <div className="lab-content">
                      <span>Phone Number : +88019 339 702 520</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="col-lg-4 col-sm-6 col-12">
                <div className="footer-top-item lab-item">
                  <div className="lab-inner d-flex align-items-center">
                    <div className="lab-thumb me-2">
                      <i className="bi bi-envelope-fill fs-4"></i>
                    </div>
                    <div className="lab-content">
                      <span>Email : admin@chatprox.com</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="col-lg-4 col-sm-6 col-12">
                <div className="footer-top-item lab-item">
                  <div className="lab-inner d-flex align-items-center">
                    <div className="lab-thumb me-2">
                      <i className="bi bi-geo-alt-fill fs-4"></i>
                    </div>
                    <div className="lab-content">
                      <span>Address : 30 North West New York 240</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="footer-bottom-content text-center">
                  <p>
                    © 2022 <a href="/">MLM Project</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
  );
};

export default Footer;