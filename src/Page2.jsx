import React, { useEffect, useState } from "react";
import axios from "axios";
import Banner from "./Banner";
import CitySection from "./CitySection";
import Footer from "./Footer";
import HeroSection from "./HeroSection";
import "./Page2.css";

// ============================================================
// ✅ MANUALLY SET GROCERY PRICES HERE
// Change any price below — it will update across the whole app
// ============================================================
const GROCERY_PRICES = {
  // Fruits & Vegetables
  "Apple":           80,
  "Banana":          40,
  "Tomato":          30,
  "Onion":           25,
  "Potato":          20,
  "Spinach":         35,
  "Carrot":          45,
  "Mango":           120,

  // Dairy
  "Milk":            60,
  "Curd":            50,
  "Paneer":          100,
  "Butter":          55,
  "Cheese":          150,

  // Snacks
  "Chips":           20,
  "Biscuit":         15,
  "Namkeen":         30,
  "Wafers":          20,
  "Popcorn":         25,

  // Drinks
  "Juice":           80,
  "Soft Drink":      45,
  "Water Bottle":    20,
  "Energy Drink":    110,

  // Grains & Staples
  "Rice":            70,
  "Dal":             90,
  "Wheat Flour":     55,
  "Sugar":           45,
  "Salt":            20,

  // Ready to Eat
  "Maggi":           14,
  "Instant Oats":    99,
  "Cup Noodles":     30,

  // Default — used if item name not in list above
  "default":         99,
};

// Helper: get price for an item by name
function getGroceryPrice(itemName) {
  // Try exact match first
  if (GROCERY_PRICES[itemName]) return GROCERY_PRICES[itemName];

  // Try partial match (case-insensitive)
  const lower = itemName.toLowerCase();
  const matchedKey = Object.keys(GROCERY_PRICES).find(
    key => lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)
  );

  return matchedKey ? GROCERY_PRICES[matchedKey] : GROCERY_PRICES["default"];
}

function Page2({ goHome, cart, setCart, user, openCart }) {

  const [grocery, setGrocery]               = useState([]);
  const [filteredGrocery, setFilteredGrocery] = useState([]);
  const [categories, setCategories]         = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  // 🔥 POPUP STATE
  const [showConfirm, setShowConfirm]   = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const extraCategories = ["Gourmet", "Fresh", "Wafers", "Snacks", "Ready to Eat", "Drink"];

  useEffect(() => {
    fetchGrocery();
  }, []);

  const fetchGrocery = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/grocery");

      // ✅ Override price with manually set price from GROCERY_PRICES
      const data = res.data.map(item => ({
        ...item,
        price: getGroceryPrice(item.name), // ← uses manual price map
        type: "grocery",
      }));

      setGrocery(data);
      setFilteredGrocery(data);

      const apiCategories  = [...new Set(data.map(item => item.category))];
      const allCategories  = ["All", ...new Set([...apiCategories, ...extraCategories])];
      setCategories(allCategories);

    } catch (error) {
      console.log("Error fetching grocery", error);
    }
  };

  const filterCategory = (category) => {
    setActiveCategory(category);

    if (category === "All") {
      setFilteredGrocery(grocery);
      return;
    }

    const filtered = grocery.filter(item => item.category === category);
    setFilteredGrocery(filtered);
  };

  // 🔥 MAIN CLICK
  const handleClick = (item) => {
    if (!user) {
      alert("Please login first!");
      return;
    }

    if (cart.length > 0 && cart[0].type !== "grocery") {
      setSelectedItem(item);
      setShowConfirm(true);
      return;
    }

    addToCart(item);
  };

  // 🔥 ADD FUNCTION
  const addToCart = (item) => {
    setCart(prev => {
      const exist = prev.find(x => x.name === item.name);

      if (exist) {
        return prev.map(x =>
          x.name === item.name
            ? { ...x, qty: x.qty < 5 ? x.qty + 1 : 5 }
            : x
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });

    openCart();
  };

  // 🔥 CONFIRM YES
  const confirmClear = () => {
    setCart([{ ...selectedItem, qty: 1 }]);
    setShowConfirm(false);
    openCart();
  };

  // 🔥 CONFIRM NO
  const cancelClear = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <HeroSection />

      <div className="eatmart-page">

        <button className="eatmart-back-btn" onClick={goHome}>
          ← Back
        </button>

        <h1 className="eatmart-title">EATOZMART INSTANT GROCERY</h1>

        {/* CATEGORY */}
        <div className="cuisine-scroll">
          <div className="cuisine-nodes">
            {categories.map((cat, index) => (
              <button
                key={index}
                className={`cuisine-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => filterCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="eatmart-grid">
          {filteredGrocery.map((item, index) => (
            <div
              className="eatmart-card"
              key={index}
              onClick={() => handleClick(item)}
            >
              <img src={item.image} alt={item.name} />
              <div className="eatmart-info">
                <h3>{item.name}</h3>
                {/* ✅ Shows manual price */}
                <p>₹{item.price}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 🔥 CONFIRM POPUP */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Clear your cart?</h3>
            <p>Food & Grocery are different categories</p>
            <div className="confirm-buttons">
              <button onClick={confirmClear}>Yes, Clear</button>
              <button onClick={cancelClear}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Banner />
      <CitySection />
      <Footer />
    </>
  );
}

export default Page2;