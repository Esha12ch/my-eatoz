import React, { useState, useEffect, useRef } from "react";
import "./HamburgerSidebar.css";

function HamburgerSidebar({ isOpen, onClose }) {

  const [activePage, setActivePage] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  /* Agent AI states */
  const [messages, setMessages] = useState([
    {type:"bot",text:"Hello 👋 I am EATOZ Agent AI. Ask me to track order, cancel order, driver details or order history."}
  ]);
  const [input, setInput] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating,setRating]=useState(0);

  const chatEndRef = useRef(null);

  /* auto order id */
  const [orderId] = useState("ORD" + Math.floor(Math.random()*90000 + 10000));

  const menuRef = useRef();

  /* close when clicking outside */
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  /* auto scroll chat */
  useEffect(()=>{
    if(chatEndRef.current){
      chatEndRef.current.scrollIntoView({behavior:"smooth"});
    }
  },[messages]);

  /* reset chat after rating */
  const handleRating = (star)=>{
    setRating(star);

    setTimeout(()=>{
      setMessages([
        {type:"bot",text:"Hello 👋 I am EATOZ Agent AI. Ask me to track order, cancel order, driver details or order history."}
      ]);
      setShowFeedback(false);
      setRating(0);
    },800);
  };

  /* send chat message */
  const sendMessage = () => {

    if(!input.trim()) return;

    const userMsg = { type:"user", text:input };
    setMessages(prev => [...prev, userMsg]);

    let reply = "Sorry, I didn't understand. Try asking about order tracking, cancel order, driver details or order history.";

    const msg = input.toLowerCase();

    if(msg.includes("track")){
      reply = `Your order ${orderId} is currently being prepared at the restaurant.`;
    }

    if(msg.includes("cancel")){
      reply = `Are you sure you want to cancel order ${orderId}? Type CONFIRM CANCEL ${orderId} to proceed.`;
    }

    if(msg.includes(`confirm cancel ${orderId.toLowerCase()}`)){
      reply = `Order ${orderId} cancelled successfully. Refund will be processed within 3-5 working days.`;
      setShowFeedback(true);
    }

    if(msg.includes("driver")){
      reply = `Delivery partner Rahul is assigned. Contact: +91 98XXXXXX12`;
    }

    if(msg.includes("history")){
      reply = `Previous Orders:
• ${orderId} - Delivered
• ORD45213 - Delivered
• ORD88221 - Cancelled`;
    }

    if(msg.includes("feedback")){
      reply = "Please rate your experience below.";
      setShowFeedback(true);
    }

    setTimeout(()=>{
      setMessages(prev => [...prev, { type:"bot", text:reply }]);
    },500);

    setInput("");
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="hamSB-dropdown" ref={menuRef}>

      <div className="hamSB-menu">

        <div className="hamSB-item" onClick={() => setActivePage("contact")}>
          Contact
        </div>

        <div className="hamSB-item" onClick={() => setActivePage("help")}>
          Help
        </div>

        <div className="hamSB-item" onClick={() => setActivePage("privacy")}>
          Privacy Policy
        </div>

        <div className="hamSB-item" onClick={() => setActivePage("legal")}>
          Legal
        </div>

        <div className="hamSB-item" onClick={() => setActivePage("agent")}>
          Agent AI
        </div>

      </div>

      {activePage && (

        <div className="hamSB-rectPage">

          {/* CONTACT */}

          {activePage === "contact" && (
            <>
              <h2 className="hamSB-title">EATOZ Pan-India Support</h2>

              <div className="hamSB-contactGrid">

                <div className="cityCard">
                  <h3>Delhi NCR</h3>
                  <p>Phone: +91 9811011111</p>
                  <p>Email: delhi@eatoz.com</p>
                  <p>Address: Connaught Place, New Delhi</p>
                </div>

                <div className="cityCard">
                  <h3>Mumbai</h3>
                  <p>Phone: +91 9811022222</p>
                  <p>Email: mumbai@eatoz.com</p>
                  <p>Address: Bandra Kurla Complex, Mumbai</p>
                </div>

                <div className="cityCard">
                  <h3>Bangalore</h3>
                  <p>Phone: +91 9811033333</p>
                  <p>Email: bangalore@eatoz.com</p>
                  <p>Address: MG Road, Bengaluru</p>
                </div>

                <div className="cityCard">
                  <h3>Hyderabad</h3>
                  <p>Phone: +91 9811044444</p>
                  <p>Email: hyderabad@eatoz.com</p>
                  <p>Address: HITEC City, Hyderabad</p>
                </div>

                <div className="cityCard">
                  <h3>Chennai</h3>
                  <p>Phone: +91 9811055555</p>
                  <p>Email: chennai@eatoz.com</p>
                  <p>Address: T Nagar, Chennai</p>
                </div>

                <div className="cityCard">
                  <h3>Kolkata</h3>
                  <p>Phone: +91 9811066666</p>
                  <p>Email: kolkata@eatoz.com</p>
                  <p>Address: Salt Lake Sector V, Kolkata</p>
                </div>

              </div>
            </>
          )}

          {/* HELP */}

          {activePage === "help" && (
            <div className="simpleText">

              <h3>Order Issues</h3>
              <p>• Track your order status</p>
              <p>• Cancel or modify an order</p>
              <p>• Late delivery assistance</p>

              <h3>Payment Problems</h3>
              <p>• Payment failed but money deducted</p>
              <p>• Refund status and processing time</p>
              <p>• UPI / card payment errors</p>

              <h3>Delivery Problems</h3>
              <p>• Order not delivered</p>
              <p>• Wrong item delivered</p>
              <p>• Missing items in order</p>

              <h3>Account Support</h3>
              <p>• Forgot password</p>
              <p>• Update phone number</p>
              <p>• Manage saved delivery addresses</p>

              <h3>Restaurant Issues</h3>
              <p>• Restaurant cancelled order</p>
              <p>• Food quality complaint</p>
              <p>• Restaurant preparation delay</p>

            </div>
          )}

          {/* PRIVACY */}

          {activePage === "privacy" && (
            <div className="simpleText">

              <h3>EATOZ Privacy Policy</h3>

              <p>
              EATOZ respects user privacy. Personal information provided while using the platform
              is securely stored and used only for service improvements.
              </p>

              <p>
              Orders cancelled after <b>38 seconds</b> of confirmation may result in cancellation
              charges depending on the preparation status of the restaurant.
              </p>

              <p>
              Repeated cancellation of orders after food preparation begins may lead to account
              restrictions or temporary suspension.
              </p>

              <p>
              Any misuse of the platform, fraudulent payment activity, or abuse towards delivery
              partners may lead to permanent account termination and possible legal action.
              </p>

              <p>
              All platform designs, brand assets and software elements belong to EATOZ and are
              protected by copyright laws.
              </p>

              <div className="policyAccept">

                <label className="policyCheck">
                  <input
                    type="checkbox"
                    onChange={(e)=>setAcceptedPolicy(e.target.checked)}
                  />
                  I accept EATOZ privacy policy
                </label>

                <button
                  className="acceptBtn"
                  disabled={!acceptedPolicy}
                  onClick={()=>{
                    setShowWelcome(true);
                    setTimeout(()=>setShowWelcome(false),3000);
                  }}
                >
                  Accept
                </button>

              </div>

            </div>
          )}

          {/* LEGAL */}

          {activePage === "legal" && (
            <p className="simpleText">
              All EATOZ content and services are protected by applicable intellectual property laws.
            </p>
          )}

          {/* AGENT AI */}

          {activePage === "agent" && (

            <div className="agentAI">

              <div className="agentHeader">
                Agent AI Support
              </div>

              <div className="chatWindow">

                {messages.map((m,i)=>(
                  <div key={i} className={m.type==="user"?"userMsg":"botMsg"}>
                    {m.text}
                  </div>
                ))}

                <div ref={chatEndRef}></div>

              </div>

              <div className="chatInputArea">

                <input
                  value={input}
                  onChange={(e)=>setInput(e.target.value)}
                  placeholder="Ask about order tracking, cancel order..."
                  onKeyDown={(e)=>{
                    if(e.key==="Enter"){
                      sendMessage();
                    }
                  }}
                />

                <button onClick={sendMessage}>
                  Send
                </button>

              </div>

              {showFeedback && (
                <div className="feedbackBox">
                  <p>Rate your experience</p>

                  <div className="stars">
                    {[1,2,3,4,5].map((star)=>(
                      <span
                        key={star}
                        onClick={()=>handleRating(star)}
                        style={{color: star<=rating ? "gold":"gray", cursor:"pointer"}}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                </div>
              )}

            </div>

          )}

        </div>
      )}

    </div>

    {showWelcome && (
      <div className="welcomeOverlay">
        <h1>EATOZ welcomes you</h1>
      </div>
    )}

    </>
  );
}

export default HamburgerSidebar;