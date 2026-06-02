import React from 'react';
import './Footer.css';
import { FaApple, FaGooglePlay } from 'react-icons/fa';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-logo">
          <h2>🍴Eatoz</h2>
          <p>© 2025 Eatoz Limited</p>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h3>Company</h3>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/corporate">Eatoz Corporate</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/team">Team</a></li>
              <li><a href="/one">Eatoz One</a></li>
              <li><a href="/instant">Eatoz Instant</a></li>
              <li><a href="/genie">Eatoz Genie</a></li>
              <li><a href="/money">Eatoz Money</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Contact us</h3>
            <ul>
              <li><a href="/help">Help & Support</a></li>
              <li><a href="/partner">Partner With Us</a></li>
              <li><a href="/ride">Ride With Us</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Legal</h3>
            <ul>
              <li><a href="/terms">Terms & Conditions</a></li>
              <li><a href="/cookie">Cookie Policy</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Available in:</h3>
            <ul className="cities-list">
              <li>Bangalore</li>
              <li>Gurgaon</li>
              <li>Hyderabad</li>
              <li>Delhi</li>
              <li>Mumbai</li>
              <li>Pune</li>
              <li>Kolkata</li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Life at Eatoz</h3>
            <ul>
              <li><a href="/explore">Explore With Eatoz</a></li>
              <li><a href="/news">Eatoz News</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-social">
          <h3>Social Links</h3>
          <div className="social-icons">
            <a href="https://facebook.com/eatoz" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com/eatoz" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com/eatoz" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com/company/eatoz" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>

        <div className="footer-app">
          <p>For better experience, download the Eatoz app now</p>
          <div className="app-buttons">
            <a href="#" className="app-button">
              <FaApple />
              <span>Download on the App Store</span>
            </a>
            <a href="#" className="app-button">
              <FaGooglePlay />
              <span>GET IT ON Google Play</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;