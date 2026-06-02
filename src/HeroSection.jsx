import React, { useState, useEffect, useRef } from 'react';
import './HeroSection.css';

const HeroSection = () => {
  const videos = [
    { 
      src: "RICH.mp4", 
      title: "Premium Dining", 
      subtitle:  "Delivered Fast",
      searchPlaceholder: "Search for restaurants..."
    },
    { 
      src: "gas.mp4", 
      title: "It's Never Too", 
      subtitle:  "Late To Order",
      searchPlaceholder: "Find cuisines near you..."
    },
    { 
      src: "me.mp4", 
      title: "Fresh & Delicious", 
      subtitle:  "Only For You",
      searchPlaceholder: "Enter your location..."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUtensils, setShowUtensils] = useState(true);
  const utensilsRef = useRef(null);

  // Utensils animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowUtensils(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto video change every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === videos.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [videos.length]);

  return (
    <section className="hero">
      {showUtensils && (
        <div className="utensils-animation" ref={utensilsRef}>
          <div className="fork">🍴</div>
          <div className="spoon">🍴</div>
        </div>
      )}

      <div className="hero-fixed-container">
        {videos.map((video, index) => (
          <video
            key={index}
            autoPlay
            loop
            muted
            playsInline
            className={`background-video ${index === currentIndex ? 'active' : ''}`}
          >
            <source src={video.src} type="video/mp4" />
          </video>
        ))}

        <div className="hero-content">
          <div className="text-content">
            <h1 className="hero-title">
              <span className="highlight">{videos[currentIndex].title}</span>
              <span className="highlight">{videos[currentIndex].subtitle}</span>
            </h1>
            <p className="hero-subtitle">
              Eatoz Is Always For You And By You
            </p>
          </div>
          
          <div className="search-bar-container">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder={videos[currentIndex].searchPlaceholder} 
                className="search-input"
              />
              <button className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                  <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;