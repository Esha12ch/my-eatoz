import React, { useState, useEffect } from "react";
import axios from "axios";
import Booking from "./Booking";
import "./Page3.css";

import HeroSection from "./HeroSection";
import Banner from "./Banner";
import CitySection from "./CitySection";
import Footer from "./Footer";

function Page3({ goHome }) {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [bookingRestaurant, setBookingRestaurant] = useState(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || null;

  const extraCategories = ["Nearby","Continental","Luxury","For 2","For 3","Party","Buffet"];

  useEffect(() => {
    fetchRestaurants();
    setCategories(extraCategories);
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/restaurants");
      setRestaurants(res.data);
      setFilteredRestaurants(res.data);
    } catch (error) {
      console.log("Error fetching restaurants");
    }
  };

  const filterCategory = (category) => {
    setActiveCategory(category);
    if (category === "All") return setFilteredRestaurants(restaurants);
    setFilteredRestaurants(
      restaurants.filter((item) => item.cuisine.includes(category))
    );
  };

  const handleSignInPrompt = () => {
    setShowSignInPrompt(true);
    setTimeout(() => setShowSignInPrompt(false), 2500);
  };

  return (
    <>
      <HeroSection />

      <div className="dineout-page">
        <div className="page-header">
          <h1>EATOZ Restaurants</h1>
          <p>Book your table at the finest restaurants near you</p>
        </div>

        <div className="dineout-container">
          <div className="dineout-sidebar">
            <button className="dineout-back-btn" onClick={goHome}>
              ← Back
            </button>
            <h2 className="sidebar-title">Categories</h2>
            <div className="sidebar-categories">
              <button className={`sidebar-btn ${activeCategory==="All"?"active":""}`} onClick={()=>filterCategory("All")}>All</button>
              {categories.map((category,index)=>(
                <button key={index} className={`sidebar-btn ${activeCategory===category?"active":""}`} onClick={()=>filterCategory(category)}>
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="dineout-grid">
            {filteredRestaurants.length > 0 ? filteredRestaurants.map((item,index)=>(
              <div className="dineout-card" key={index}>
                <div className="dineout-img-container">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="dineout-info">
                  <h3>{item.name}</h3>
                  <p>{item.cuisine}</p>
                  <span>⭐ {item.rating}</span>
                </div>
                <button
                  className="book-table-btn"
                  onClick={() => user ? setBookingRestaurant(item) : handleSignInPrompt()}
                >
                  Book a Table
                </button>
              </div>
            )) : <p style={{color:"white",textAlign:"center"}}>No restaurants found</p>}
          </div>
        </div>
      </div>

      {bookingRestaurant && (
        <Booking
          restaurant={bookingRestaurant}
          onClose={()=>setBookingRestaurant(null)}
          user={user}
          onSignInPrompt={handleSignInPrompt}
        />
      )}

      {showSignInPrompt && (
        <div className="signin-warning">
          Please sign in first to book a table!
        </div>
      )}

      <Banner />
      <CitySection />
      <Footer />
    </>
  );
}

export default Page3;