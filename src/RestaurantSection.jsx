import React, { useState, useRef } from 'react';
import './RestaurantSection.css';

const RestaurantSection = () => {
  const [activeTimeSelector, setActiveTimeSelector] = useState(null);
  const scrollRef = useRef(null);
  
  const restaurants = [
    {
      id: 1,
      name: "Daryaganj",
      image: "https://dineout-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/v1677099790/fd6a599cb89a201794bc6997f257499c.jpg",
      cuisine: "North Indian",
      price: "₹1600 for two",
      location: "Sham Nath Marg, Civil Lines, Delhi",
      rating: "4.7",
      timeSlots: ["OPEN TILL 11PM"],
      discounts: ["Flat 10% Cashback"],
    
    },
    {
      id: 2,
      name: "Baluchi - The Lalit",
      image: "https://www.chiclifebyte.com/wp-content/uploads/2016/09/Baluchi-2.jpg",
      cuisine: "Awadhi, North Indian",
      price: "₹3000 for two",
      location: " Connaught Place Near Barakhamba Metro",
      rating: "4.2",
      timeSlots: ["Noon - 3PM · 7PM - 11:30PM"],
      discounts: ["Flat 30% Offon total bill @₹25/guest"],
      
    },
    {
      id: 3,
      name: "The Yellow Bowl",
      image: "https://dineout-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/v1672036336/1e7ebe8248ce084252c96b9493ce5de9.webp",
      cuisine: "Chinese",
      price: "₹400 for two",
      location: " Netaji Subhash Marg",
      rating: "4.4",
      timeSlots: ["Noon - 11:30PM"],
      discounts: ["Flat 10% Off on total bill"],
    },
    {
      id: 4,
      name: "Chicken Inn",
      image: "https://dineout-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/DINEOUT_ALL_RESTAURANTS/IMAGES/RESTAURANT_IMAGE_SERVICE/2025/4/28/d82d88ee-f07a-453e-aa7b-f729ab71453b_A12b673fe0bc649829c4b7a7093bbb779.JPG",
      cuisine: "North Indian",
      price: "₹1500 for two",
      location: "Pandara Road Market, Delhi",
      rating: "4",
      timeSlots: ["Noon - 1AM"],
      discounts: ["40% anniversary special", "20% weekday lunch"],
      Facilities: "Alcohol served • Reservation available"
    },
    {
      id: 5,
      name: "The Beer Cafe",
      image: "https://dineout-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/v1709042607/80959273668dece77f998bc84d6f3859.jpg",
      cuisine: "Finger Food,North Indian",
      price: "₹2000 for two",
      location: "Janpath, Connaught Place",
      rating: "4.6",
      timeSlots: ["11AM - 1AM"],
      discounts: ["Flat 30% Off on Pre-book offer"],
  
    },
    {
      id: 6,
      name: "Khubani",
      image: "https://dineout-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/DINEOUT_ALL_RESTAURANTS/IMAGES/RESTAURANT_IMAGE_SERVICE/2025/1/31/13f19168-f576-4f6a-9a9d-180e63b2aa2f_54b454ec694384236b67f32f44e1989cf.JPG",
      cuisine: "Asian,Mediterranean",
      price: "₹4500 for two",
      location: " Aerocity, South Delhi",
      rating: "3.3",
      timeSlots: ["Noon - 5A.M"],
      discounts: ["Flat 10% Cashback"],
      freeDrink: "Free Drink"
    },
    {
      id: 7,
      name: "Blues",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      cuisine: "Continental",
      price: "₹2000 for two",
      location: "Outer Circle Connaught Place ",
      rating: "4.1",
      timeSlots: ["7:00 PM", "8:30 PM", "10:00 PM"],
      discounts: ["Flat 20% Off + Free Dessert on Pre-book offer"],
      
    },

     {
      id: 8,
      name: "Tamra - Shangri La Eros",
      image: "https://dineout-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/v1664311023/xyhqly0gwxjute3gcuri.jpg",
      cuisine: "Continental,European",
      price: "₹3500 for two",
      location: "Shangri-La'S - Eros Hotel, 19, Ashoka Rd, Janpath ",
      rating: "4.4",
      timeSlots: ["7AM - 11:30PM"],
      discounts: ["Flat 20% Off on total bill"],
      
    },

    
     {
      id: 9,
      name: "Hyderabadi Biryani House",
      image: "https://dineout-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/v1674642170/d2a063a5d441979f775dd2c1da6a86e9.webp",
      cuisine: "Biryani",
      price: "₹600 for two",
      location: "Jama Masjid Near Kasturba Hospital",
      rating: "4.7",
      timeSlots: ["Noon - 11:59PM"],
      discounts: ["Flat 10% Offon total bill"],
      
    },

    {
      id: 10,
      name: "Cafe Hawkers",
      image: "https://dineout-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/v1703756797/5907cc7b555d70c91e10bc38cd8ecdc6.jpg",
      cuisine: "Continental,North Indian",
      price: "₹800 for two",
      location: "L-22, Radial Road,Connaught Place",
      rating: "4.2",
      timeSlots: ["11AM - 11:30PM"],
      discounts: ["Flat 30% Off on total bill"],
      
    },
 
  ];

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const toggleTimeSlots = (id) => {
    setActiveTimeSelector(activeTimeSelector === id ? null : id);
  };

  return (
    <section className="restaurant-section">
      <div className="section-header">
        <h2 className="animated-heading">Epicurean Excellence Awaits</h2>
        <p className="section-subtitle">Delhi-NCR's most distinguished dining destinations</p>
      </div>
      
      <div className="restaurant-scroll-container">
        <button className="scroll-arrow left" onClick={scrollLeft}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <div className="restaurant-cards-container" ref={scrollRef}>
          {restaurants.map(restaurant => (
            <div className="restaurant-card" key={restaurant.id}>
              <div className="card-image-container">
                <img src={restaurant.image} alt={restaurant.name} className="card-image" />
                <div className="rating-badge">⭐ {restaurant.rating}</div>
              </div>
              
              <div className="card-content">
                <div className="card-header">
                  <h3 className="restaurant-name">{restaurant.name}</h3>
                  <div className="price-badge">{restaurant.price}</div>
                </div>
                
                <p className="cuisine-type">{restaurant.cuisine}</p>
                <p className="location">{restaurant.location}</p>
                
                <div className="offers-section">
                  {restaurant.discounts.map((discount, index) => (
                    <span key={index} className="discount-badge">{discount}</span>
                  ))}
                  {restaurant.freeDrink && (
                    <span className="free-drink-badge">{restaurant.freeDrink}</span>
                  )}
                </div>
                
                <div className="time-selector">
                  <button 
                    className="time-selector-btn"
                    onClick={() => toggleTimeSlots(restaurant.id)}
                  >
                    {activeTimeSelector === restaurant.id ? 'Hide Times' : 'Reserve Table'}
                  </button>
                  
                  <div className={`time-slots ${activeTimeSelector === restaurant.id ? 'active' : ''}`}>
                    {restaurant.timeSlots.map((time, index) => (
                      <span key={index} className="time-slot">{time}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="scroll-arrow right" onClick={scrollRight}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </section>
  );
};

export default RestaurantSection;