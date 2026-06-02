import React from 'react';
import './Banner.css';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

const Banner = () => {
  return (
    <div className="banner-container">
      <div className="banner-content">
        <h2 className="banner-heading">Get the Eatoz App now!</h2>
        <p className="banner-text">For best offers and discounts curated specially for you.</p>
        
        <div className="banner-cta">
          <p className="scan-text">Scan to download</p>
          <div className="qr-container">
            <img 
              src="SCNNER.png"
              alt="Eatoz App Download QR Code" 
              className="qr-code"
              width={120}
              height={120}
            />
          </div>
          
          <div className="download-buttons">
            <button className="download-btn">
              <FaGooglePlay />
              <span>Google Play</span>
            </button>
            <button className="download-btn">
              <FaApple />
              <span>App Store</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;