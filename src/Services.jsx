import React from "react";
import "./Services.css";

const Services = ({ openPage1, openPage2, openPage3 }) => {

  return (
    <section className="services">

      <div className="services-grid">

        {/* FOOD DELIVERY */}
        <div className="service-card" onClick={openPage1}>
          <img src="FOOD.jpg" alt="Food Delivery" />

          <div className="service-card-content">
            <h3>FOOD DELIVERY</h3>
            <p>UPTO 60% OFF</p>
          </div>
        </div>


        {/* GROCERY */}
        <div className="service-card" onClick={openPage2}>
          <img
            src="https://t3.ftcdn.net/jpg/13/42/60/48/240_F_1342604881_ejV7nlGLkZOemacGWAoU6cnIJVuIOwWk.jpg"
            alt="Instant Grocery"
          />

          <div className="service-card-content">
            <h3>EATOZMART INSTANT GROCERY & OTHERS</h3>
            <p>UPTO 60% OFF</p>
          </div>
        </div>


        {/* RESTAURANTS / DINEOUT */}
        <div className="service-card" onClick={openPage3}>
          <img src="hotel.jpg" alt="Dine Out" />

          <div className="service-card-content">
            <h3>DINEOUT EAT OUT & SAVE MORE</h3>
            <p>UPTO 50% OFF</p>
          </div>
        </div>

      </div>

    </section>
  );
};

export default Services;