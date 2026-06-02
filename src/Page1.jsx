import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Page1.css";

import HeroSection from "./HeroSection";
import Banner from "./Banner";
import CitySection from "./CitySection";
import Footer from "./Footer";

function Page1({ goHome, openMenu, user }) {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [activeCuisine, setActiveCuisine] = useState("All");
  const [loading, setLoading] = useState(true);

  const extraCuisines = [
    "Snacks","Chinese","Pizza","Burger","Desserts",
    "South Indian","North Indian","Italian","Mexican",
    "Continental","Beverages","Salads","Fast Food",
    "Sweets","Seafood"
  ];

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/food");
      const allItems = res.data;

      // ✅ FIX: Group by brand — pick one representative item per unique brand
      const brandMap = {};
      allItems.forEach(item => {
        if (item.brand && !brandMap[item.brand]) {
          brandMap[item.brand] = item; // first item for this brand becomes the card
        }
      });

      const uniqueBrands = Object.values(brandMap);

      setBrands(uniqueBrands);
      setFilteredBrands(uniqueBrands);

      const apiCuisines = [...new Set(uniqueBrands.map(item => item.cuisine).filter(Boolean))];
      const allCuisines = ["All", ...new Set([...apiCuisines, ...extraCuisines])];
      setCuisines(allCuisines);

    } catch (err) {
      console.log("Error fetching foods", err);
    } finally {
      setLoading(false);
    }
  };

  const filterCuisine = (cuisine) => {
    setActiveCuisine(cuisine);
    if (cuisine === "All") {
      setFilteredBrands(brands);
      return;
    }
    setFilteredBrands(brands.filter(item => item.cuisine === cuisine));
  };

  // ADMIN ADD
  const handleAddBrand = async () => {
    const name = prompt("Enter brand name:");
    const cuisine = prompt("Enter cuisine type:");
    if (!name || !cuisine) return;

    try {
      await axios.post(
        "http://localhost:5000/api/food",
        { name, brand: name, cuisine, rating: 0, image: "https://via.placeholder.com/200" },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchFoods();
    } catch (err) {
      console.log(err);
      alert("Failed to add brand");
    }
  };

  // ADMIN DELETE
  const handleDeleteBrand = async (brandName) => {
    if (!window.confirm(`Delete brand "${brandName}" and ALL its items?`)) return;

    try {
      // Delete all items with this brand
      const res = await axios.get("http://localhost:5000/api/food");
      const toDelete = res.data.filter(item => item.brand === brandName);

      await Promise.all(
        toDelete.map(item =>
          axios.delete(`http://localhost:5000/api/food/${item._id}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          })
        )
      );
      fetchFoods();
    } catch (err) {
      console.log(err);
      alert("Failed to delete brand");
    }
  };

  return (
    <>
      <HeroSection />

      <div className="page1">
        <button className="back-btn" onClick={goHome}>
          ← Back
        </button>

        <h1 className="page-title">Food Delivery</h1>

        {/* ADMIN BUTTON */}
        {user?.role === "admin" && (
          <button className="add-btn" onClick={handleAddBrand}>
            + Add Brand
          </button>
        )}

        <div className="page1-layout">

          {/* LEFT SIDEBAR */}
          <div className="cuisine-sidebar">
            {cuisines.map((cuisine, index) => (
              <button
                key={index}
                className={`cuisine-btn ${activeCuisine === cuisine ? "active" : ""}`}
                onClick={() => filterCuisine(cuisine)}
              >
                {cuisine}
              </button>
            ))}
          </div>

          {/* RIGHT CONTENT */}
          <div className="food-section">
            {loading ? (
              <div className="loader">
                <div className="spinner"></div>
                <p>Loading delicious food...</p>
              </div>
            ) : (
              <div className="food-grid">
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((item, index) => (
                    <div className="food-card" key={index}>
                      <img
                        src={item.image}
                        alt={item.brand}
                        loading="lazy"
                        onClick={() => openMenu(item.brand)}
                      />

                      <div className="food-info">
                        <h3>{item.brand}</h3>
                        <p>{item.cuisine}</p>
                        <span>⭐ {item.rating}</span>
                      </div>

                      {user?.role === "admin" && (
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteBrand(item.brand)}
                        >
                          Delete Brand
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-data">No items found!</p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      <Banner />
      <CitySection />
      <Footer />
    </>
  );
}

export default Page1;