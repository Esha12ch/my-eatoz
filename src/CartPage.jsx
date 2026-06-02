import { useState, useEffect } from "react";
import axios from "axios";
import "./CartPage.css";

function CartPage({ cart, setCart, goBack, user }) {
  const [showPayment, setShowPayment] = useState(false);
  const [walletBalance, setWalletBalance] = useState(5000);
  const [selectedMethod, setSelectedMethod] = useState("UPI");
  const [timeLeft, setTimeLeft] = useState(180);
  const [orderStatus, setOrderStatus] = useState(null); // "placed" | "canceled"

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const coupons = {
    FIRST50: 50,
    FEAST30: 30,
    MART15: 15,
    BULK200: 200,
    FRESH10: 10,
  };

  if (!user) {
    return (
      <div className="cartpage">
        <button className="cart-back" onClick={goBack}>← Back</button>
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h2>Please Login</h2>
          <p>Login to view your cart</p>
        </div>
      </div>
    );
  }

  const increase = (item) =>
    setCart((prev) =>
      prev.map((x) => (x.name === item.name ? { ...x, qty: Math.min(x.qty + 1, 5) } : x))
    );
  const decrease = (item) =>
    setCart((prev) =>
      prev.map((x) => (x.name === item.name ? { ...x, qty: x.qty - 1 } : x)).filter((x) => x.qty > 0)
    );

  const applyCoupon = () => {
    const code = coupon.toUpperCase();
    if (!coupons[code]) return alert("Invalid Coupon");
    setAppliedCoupon({ code, value: coupons[code] });
  };

  const total = cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  const gst = Math.round(total * 0.1);
  const discount = appliedCoupon
    ? appliedCoupon.value < 100
      ? Math.round((total * appliedCoupon.value) / 100)
      : appliedCoupon.value
    : 0;
  const finalTotal = total + gst - discount;

  // Timer
  useEffect(() => {
    if (!showPayment) return;
    if (timeLeft <= 0) {
      setShowPayment(false);
      setOrderStatus("canceled");
      setTimeLeft(180);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showPayment]);

  const handleWalletPayment = async () => {
    if (walletBalance >= finalTotal) {
      setWalletBalance((prev) => prev - finalTotal);
      try {
        await axios.post("http://localhost:5000/api/orders/save", {
          userId: user._id,
          items: cart,
          total: finalTotal,
          paymentMethod: "Wallet",
        });
      } catch (err) {
        console.error("Failed to save wallet order:", err);
      }
      handleOrderSuccess("Wallet");
    } else {
      alert("❌ Insufficient Wallet Balance");
    }
  };

  const handlePayLater = async () => {
    try {
      await axios.post("http://localhost:5000/api/orders/save", {
        userId: user._id,
        items: cart,
        total: finalTotal,
        paymentMethod: "Pay Later",
      });
    } catch (err) {
      console.error("Failed to save Pay Later order:", err);
    }
    handleOrderSuccess("Pay Later");
  };

  // ─────────────────────────────────────────────────────────────
  // 🔥 RAZORPAY — opens popup, saves order on success, no conditions
  // ─────────────────────────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    try {
      const orderRes = await axios.post("http://localhost:5000/api/payment/create-order", {
        amount: finalTotal,
        userId: user._id,
        items: cart,
      });

      const { orderId, currency, amount } = orderRes.data;

      const options = {
        key: "rzp_test_SWJWtczb3pn2E7",
        amount: amount,
        currency: currency,
        name: "EATOZ",
        description: "Food Order Payment",
        order_id: orderId,

        // ✅ Save order to DB on successful payment — no conditions
        handler: async function (response) {
          try {
            await axios.post("http://localhost:5000/api/orders/save", {
              userId: user._id,
              items: cart,
              total: finalTotal,
              paymentMethod: "Razorpay",
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            });
            handleOrderSuccess("Razorpay");
          } catch (err) {
            console.error("Failed to save Razorpay order:", err);
            alert("Payment done but order save failed. Contact support.");
          }
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay popup closed by user");
          },
        },

        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Unable to initiate payment. Try again.");
    }
  };

  const handleOrderSuccess = (method) => {
    setOrderStatus("placed");
    setCart([]);
    setShowPayment(false);
    setTimeLeft(180);
    console.log(`Order placed via ${method}`);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="cartpage">
      <button className="cart-back" onClick={goBack}>← Back</button>
      <h2 className="cart-title">🛒 Your Cart</h2>

      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Add delicious items to get started</p>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item, i) => (
              <div key={i} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>{item.cuisine}</p>
                  <div className="qty-box">
                    <button onClick={() => decrease(item)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => increase(item)}>+</button>
                  </div>
                </div>
                <div className="item-price">₹{item.qty * item.price}</div>
              </div>
            ))}
          </div>

          <div className="coupon-box">
            <h3>Apply Coupon</h3>
            <div className="coupon-input">
              <input
                type="text"
                placeholder="Enter Coupon Code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              <button onClick={applyCoupon}>Apply</button>
            </div>
            {appliedCoupon && <p className="coupon-success">Applied: {appliedCoupon.code}</p>}
          </div>

          <div className="cart-summary">
            <div><span>Item Total</span><span>₹{total}</span></div>
            <div><span>GST (10%)</span><span>₹{gst}</span></div>
            {appliedCoupon && <div><span>Discount</span><span>-₹{discount}</span></div>}
            <div className="final"><span>To Pay</span><span>₹{finalTotal}</span></div>
            <button className="pay-btn" onClick={() => setShowPayment(true)}>
              Proceed to Pay
            </button>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="payment-overlay">
          <div className="payment-modal">
            <button className="close-modal" onClick={() => setShowPayment(false)}>✕</button>
            <h2>💳 EATOZ Payment</h2>
            <p className="timer">
              ⏳ Time Left: {minutes}:{seconds < 10 ? "0" + seconds : seconds}
            </p>
            <p className="wallet-balance">Wallet Balance: ₹{walletBalance}</p>

            <div className="payment-methods">
              {["UPI", "Card", "Wallet", "Pay Later"].map((m) => (
                <div
                  key={m}
                  className={`method-option ${selectedMethod === m ? "active" : ""}`}
                  onClick={() => setSelectedMethod(m)}
                >
                  {m}
                </div>
              ))}
            </div>

            <div className="payment-form">
              {selectedMethod === "Wallet" && (
                <button className="wallet-pay" onClick={handleWalletPayment}>
                  Pay ₹{finalTotal} via Wallet
                </button>
              )}
              {selectedMethod === "Pay Later" && (
                <button className="paylater-btn" onClick={handlePayLater}>
                  Confirm Pay Later
                </button>
              )}
              {(selectedMethod === "UPI" || selectedMethod === "Card") && (
                <button className="pay-now" onClick={handleRazorpayPayment}>
                  Pay ₹{finalTotal}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Status Popup */}
      {orderStatus && (
        <div className="order-popup">
          <div className="order-popup-box">
            {orderStatus === "placed" && (
              <>
                <h2>✅ Order Placed!</h2>
                <p>Your order is confirmed. It will arrive soon 🚀</p>
              </>
            )}
            {orderStatus === "canceled" && (
              <>
                <h2>⏰ Order Canceled!</h2>
                <p>Payment time expired. Try ordering again.</p>
              </>
            )}
            <button onClick={() => setOrderStatus(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;