import React, { useState } from 'react';
import './CitySection.css';

const CitySection = () => {
  const allFoodCities = [
    'Bangalore', 'Gurgaon', 'Hyderabad', 'Delhi', 
    'Mumbai', 'Pune', 'Kolkata', 'Chennai', 
    'Ahmedabad', 'Chandigarh', 'Jaipur', 'Noida',
    'Lucknow', 'Indore', 'Bhopal', 'Goa', 'Nagpur',
    'Coimbatore', 'Kochi', 'Visakhapatnam', 'Patna',
    'Thiruvananthapuram', 'Mysore', 'Vadodara', 'Surat'
  ];

  const allGroceryCities = [
    'Bangalore', 'Gurgaon', 'Hyderabad', 'Delhi', 
    'Mumbai', 'Pune', 'Kolkata', 'Chennai', 
    'Ahmedabad', 'Chandigarh', 'Jaipur', 'Noida',
    'Lucknow', 'Indore', 'Bhopal', 'Goa', 'Nagpur',
    'Coimbatore', 'Kochi', 'Visakhapatnam', 'Patna'
  ];

  const [showAllFood, setShowAllFood] = useState(false);
  const [showAllGrocery, setShowAllGrocery] = useState(false);

  const initialFoodCities = allFoodCities.slice(0, 16);
  const additionalFoodCities = allFoodCities.slice(16);
  
  const initialGroceryCities = allGroceryCities.slice(0, 16);
  const additionalGroceryCities = allGroceryCities.slice(16);

  return (
    <div className="city-section-container">
      <div className="city-section white-bg">
        <div className="city-category">
          <h2 className="section-heading">Cities with food delivery</h2>
          <div className="city-grid">
            {initialFoodCities.map((city, index) => (
              <div key={`food-${index}`} className="city-item-wrapper">
                <a 
                  href={`/food-delivery/${city.toLowerCase()}`} 
                  className="city-item"
                  aria-label={`Order food in ${city}`}
                >
                  <span className="city-text">{city}</span>
                  <span className="shine-effect"></span>
                </a>
              </div>
            ))}
          </div>
          
          {additionalFoodCities.length > 0 && (
            <>
              <div className={`city-grid additional-cities ${showAllFood ? 'expanded' : 'collapsed'}`}>
                {additionalFoodCities.map((city, index) => (
                  <div key={`food-add-${index}`} className="city-item-wrapper">
                    <a 
                      href={`/food-delivery/${city.toLowerCase()}`} 
                      className="city-item"
                      aria-label={`Order food in ${city}`}
                    >
                      <span className="city-text">{city}</span>
                      <span className="shine-effect"></span>
                    </a>
                  </div>
                ))}
              </div>
              <button 
                className="show-more-btn"
                onClick={() => setShowAllFood(!showAllFood)}
                aria-expanded={showAllFood}
              >
                <span className="btn-text">
                  {showAllFood ? 'Show Less' : `Show More (${additionalFoodCities.length})`}
                </span>
                <span className="shine-effect"></span>
              </button>
            </>
          )}
        </div>

        <div className="city-category">
          <h2 className="section-heading">Cities with grocery delivery</h2>
          <div className="city-grid">
            {initialGroceryCities.map((city, index) => (
              <div key={`grocery-${index}`} className="city-item-wrapper">
                <a 
                  href={`/grocery-delivery/${city.toLowerCase()}`} 
                  className="city-item"
                  aria-label={`Order groceries in ${city}`}
                >
                  <span className="city-text">{city}</span>
                  <span className="shine-effect"></span>
                </a>
              </div>
            ))}
          </div>
          
          {additionalGroceryCities.length > 0 && (
            <>
              <div className={`city-grid additional-cities ${showAllGrocery ? 'expanded' : 'collapsed'}`}>
                {additionalGroceryCities.map((city, index) => (
                  <div key={`grocery-add-${index}`} className="city-item-wrapper">
                    <a 
                      href={`/grocery-delivery/${city.toLowerCase()}`} 
                      className="city-item"
                      aria-label={`Order groceries in ${city}`}
                    >
                      <span className="city-text">{city}</span>
                      <span className="shine-effect"></span>
                    </a>
                  </div>
                ))}
              </div>
              <button 
                className="show-more-btn"
                onClick={() => setShowAllGrocery(!showAllGrocery)}
                aria-expanded={showAllGrocery}
              >
                <span className="btn-text">
                  {showAllGrocery ? 'Show Less' : `Show More (${additionalGroceryCities.length})`}
                </span>
                <span className="shine-effect"></span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitySection;