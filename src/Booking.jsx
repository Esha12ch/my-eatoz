import React, { useState } from "react";
import axios from "axios";
import "./Booking.css";

function Booking({ restaurant, onClose, user, onSignInPrompt }) {
  const [tableSize, setTableSize]     = useState(2);
  const [time, setTime]               = useState("11:00");
  const [date, setDate]               = useState(new Date().toISOString().split("T")[0]);
  const [popupMessage, setPopupMessage] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  const timeSlots = [
    "11:00", "13:00", "15:00", "17:00",
    "19:00", "21:00", "23:00", "01:00",
  ];

  const handleBook = async () => {
    if (!user) {
      onSignInPrompt();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Save booking to database
      await axios.post("http://localhost:5000/api/bookings", {
        userId:          user._id,
        restaurant:      restaurant.name,
        restaurantImage: restaurant.image || "",
        date,
        time,
        seats:           tableSize,
      });

      setPopupMessage(
        `Table for ${tableSize} at ${time} on ${date} booked at ${restaurant.name}`
      );
    } catch (err) {
      setError("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closePopup = () => {
    setPopupMessage(null);
    onClose();
  };

  return (
    <>
      <div className="booking-overlay">
        <div className="booking-container-70-30-big">
          <button className="booking-close" onClick={onClose}>&times;</button>

          {/* Left Image */}
          <div className="booking-left">
            <img src={restaurant.image} alt={restaurant.name} />
          </div>

          {/* Right Section */}
          <div className="booking-right">
            <div className="booking-intro">
              <h2>Reserve Your Table</h2>
              <p>
                Enjoy a premium dining experience at{" "}
                <strong>{restaurant.name}</strong>. Pick your date, time, and
                table size to make your visit effortless.
              </p>
            </div>

            <div className="booking-restaurant-info">
              <h1>{restaurant.name}</h1>
              <p>{restaurant.cuisine}</p>
              <span>⭐ {restaurant.rating}</span>
            </div>

            {/* Error message */}
            {error && (
              <div
                style={{
                  background: "rgba(255,77,77,0.15)",
                  border: "1px solid rgba(255,77,77,0.4)",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  color: "#ff6b6b",
                  fontSize: "14px",
                  marginBottom: "10px",
                }}
              >
                {error}
              </div>
            )}

            <div className="booking-form-split">
              <div className="form-group">
                <label>Number of People:</label>
                <select
                  value={tableSize}
                  onChange={e => setTableSize(parseInt(e.target.value))}
                >
                  {Array.from({ length: 9 }, (_, i) => i + 2).map(num => (
                    <option key={num} value={num}>{num} people</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-group">
                <label>Time Slot:</label>
                <select value={time} onChange={e => setTime(e.target.value)}>
                  {timeSlots.map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <button
                className="book-btn-split"
                onClick={handleBook}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading
                  ? "Booking..."
                  : user
                  ? "Book Table"
                  : "Sign in to Book"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ SUCCESS POPUP */}
      {popupMessage && (
        <div className="booking-popup-overlay">
          <div className="booking-popup-box">
            <h2>✅ Booking Confirmed!</h2>
            <p>{popupMessage}</p>
            <p
              style={{
                fontSize: "13px",
                opacity: 0.6,
                marginTop: "-10px",
                marginBottom: "20px",
              }}
            >
              You can view your booking in your dashboard under Order History.
            </p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Booking;