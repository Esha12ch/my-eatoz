import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FoodMenu.css";

// ✅ CHANGE FOOD PRICE HERE — update this one value to change price everywhere
const FOOD_PRICE = 1;

function FoodMenu({ brand, goBack, cart, setCart, user }) {

  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    fetchMenu();
  }, [brand]);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/food/brand/${brand}`);

      const onlyMenu = res.data.filter(item => item.name !== item.brand);

      // ✅ Set price from the constant above
      const withFixedPrice = onlyMenu.map(item => ({
        ...item,
        price: FOOD_PRICE,
      }));

      setMenu(withFixedPrice);
      setFilteredMenu(withFixedPrice);

    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 FILTER
  const filterCategory = (type) => {
    setActiveTab(type);

    if (type === "All") {
      setFilteredMenu(menu);
      return;
    }

    let filtered = [];

    if (type === "Meals") {
      filtered = menu.filter(item =>
        item.name.toLowerCase().includes("meal")
      );
    } else if (type === "Combos") {
      filtered = menu.filter(item =>
        item.name.toLowerCase().includes("combo")
      );
    } else if (type === "Drinks") {
      filtered = menu.filter(item =>
        item.name.toLowerCase().includes("drink") ||
        item.name.toLowerCase().includes("cola") ||
        item.name.toLowerCase().includes("juice")
      );
    } else if (type === "Single") {
      filtered = menu.filter(item =>
        !item.name.toLowerCase().includes("meal") &&
        !item.name.toLowerCase().includes("combo") &&
        !item.name.toLowerCase().includes("drink")
      );
    }

    setFilteredMenu(filtered);
  };

  // 🔥 ADD TO CART
  const addToCart = (item) => {

    if (!user) {
      alert("Please login first");
      return;
    }

    setCart(prev => {

      // 🚨 IF GROCERY EXISTS
      if (prev.length > 0 && prev[0].type === "grocery") {
        const confirmClear = window.confirm(
          "⚠️ Your cart has Grocery items.\nDo you want to clear cart and add Food item?"
        );
        if (!confirmClear) return prev;

        return [{
          ...item,
          price: FOOD_PRICE,
          qty: 1,
          type: "food",
        }];
      }

      const exist = prev.find(x => x.name === item.name);

      if (exist) {
        return prev.map(x =>
          x.name === item.name
            ? { ...x, qty: x.qty < 5 ? x.qty + 1 : 5 }
            : x
        );
      }

      return [...prev, { ...item, price: FOOD_PRICE, qty: 1, type: "food" }];
    });
  };

  // 🔥 ADMIN ADD
  const handleAddItem = async () => {
    const name    = prompt("Enter item name:");
    const cuisine = prompt("Enter cuisine:");
    const image   = prompt("Enter image URL:");
    if (!name || !cuisine) return;

    try {
      await axios.post(
        "http://localhost:5000/api/food",
        { name, brand, cuisine, image, price: FOOD_PRICE, rating: 0 },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchMenu();
    } catch (err) {
      console.log(err);
      alert("Failed to add item");
    }
  };

  // 🔥 ADMIN DELETE
  const handleDeleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/food/${id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchMenu();
    } catch (err) {
      console.log(err);
      alert("Failed to delete item");
    }
  };

  return (
    <div className="foodmenu">

      <button className="foodmenu-back" onClick={goBack}>
        ← Back
      </button>

      <h2 className="foodmenu-title">{brand} Menu</h2>

      {/* CATEGORY TABS */}
      <div className="menu-scroll-wrapper">
        <div className="menu-tabs">
          {["All", "Meals", "Combos", "Single", "Drinks"].map((tab, i) => (
            <button
              key={i}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => filterCategory(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ADMIN ADD BUTTON */}
      {user?.role === "admin" && (
        <button
          style={{
            marginBottom: "20px",
            padding: "8px 16px",
            background: "#ff1a1a",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={handleAddItem}
        >
          + Add Item
        </button>
      )}

      {/* MENU GRID */}
      <div className="foodmenu-grid">
        {filteredMenu.map((item, i) => (
          <div key={i} className="foodmenu-card">

            {/* ✅ Shows actual price from FOOD_PRICE constant */}
            <div className="price-badge">₹{item.price}</div>

            <img src={item.image} alt={item.name} />

            <div className="card-content">
              <h4>{item.name}</h4>
              <p>{item.cuisine}</p>
              <span>⭐ {item.rating}</span>

              <button className="order-btn" onClick={() => addToCart(item)}>
                Add to Cart
              </button>

              {/* ADMIN DELETE */}
              {user?.role === "admin" && (
                <button
                  style={{
                    marginTop: "6px",
                    padding: "6px 10px",
                    background: "#ff4d4d",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDeleteItem(item._id)}
                >
                  Delete Item
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default FoodMenu;