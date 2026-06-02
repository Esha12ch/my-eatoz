import { useState, useEffect } from "react";
import axios from "axios";
import "./PaymentPage.css";

function PaymentPage({ cart, user, goBack }) {
  const [selectedMethod, setSelectedMethod] = useState("UPI");
  const [timeLeft, setTimeLeft] = useState(180);
  const [walletBalance, setWalletBalance] = useState(5000);
  const [orderStatus, setOrderStatus] = useState(null); // "placed" | "failed"

  const total = cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  const gst = Math.round(total * 0.1);
  const finalTotal = total + gst;

  useEffect(() => {
    if (timeLeft <= 0) {
      setOrderStatus("failed");
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleRazorpayPayment = async () => {
    try {
      // 1️⃣ Create order on backend
      const res = await axios.post("http://localhost:5000/api/payment/create-order", {
        amount: finalTotal,
        currency: "INR",
        userId: user._id,
        items: cart,
      });

      const { orderId, amount, currency } = res.data;

      // 2️⃣ Open Razorpay popup
      const options = {
        key: "rzp_test_SWJWtczb3pn2E7", // your test key
        amount,
        currency,
        name: "EATOZ",
        description: "Food Order Payment",
        order_id: orderId,
        handler: async function (response) {
          // 3️⃣ Verify payment on backend
          try {
            const verifyRes = await axios.post("http://localhost:5000/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user._id,
              items: cart,
              total: finalTotal,
            });

            if (verifyRes.data.success) {
              setOrderStatus("placed");
            } else {
              setOrderStatus("failed");
            }
          } catch (err) {
            console.error(err);
            setOrderStatus("failed");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment initialization failed");
    }
  };

  const handleWalletPayment = () => {
    if (walletBalance >= finalTotal) {
      setWalletBalance(prev => prev - finalTotal);
      setOrderStatus("placed");
    } else {
      alert("❌ Insufficient Wallet Balance");
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="payment-page">
      <button className="pay-back" onClick={goBack}>← Back</button>

      <div className="payment-card">
        <h2 className="title">💳 EATOZ Payment Gateway</h2>

        <div className="timer">⏳ Time Left: {minutes}:{seconds < 10 ? "0" : ""}{seconds}</div>
        <div className="amount-box">Payable Amount: ₹{finalTotal}</div>

        <div className="payment-methods">
          {["UPI","Card","Wallet","Pay Later"].map(m=>(
            <div
              key={m}
              className={`method-option ${selectedMethod===m ? "active" : ""}`}
              onClick={()=>setSelectedMethod(m)}
            >
              {m}
            </div>
          ))}
        </div>

        <div className="payment-form">
          {selectedMethod==="Wallet" && (
            <button className="wallet-pay" onClick={handleWalletPayment}>
              Pay ₹{finalTotal} via Wallet
            </button>
          )}
          {selectedMethod==="Pay Later" && (
            <button className="paylater-btn" onClick={()=>setOrderStatus("placed")}>
              Confirm Pay Later
            </button>
          )}
          {selectedMethod==="UPI" || selectedMethod==="Card" ? (
            <button className="pay-now" onClick={handleRazorpayPayment}>
              Pay Now ₹{finalTotal}
            </button>
          ) : null}
        </div>

        {orderStatus === "placed" && (
          <div className="order-success">
            ✅ Payment Successful! Your order is confirmed.
            <button onClick={goBack}>Close</button>
          </div>
        )}
        {orderStatus === "failed" && (
          <div className="order-failed">
            ❌ Payment Failed! Please try again.
            <button onClick={goBack}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentPage;