import React, { useEffect, useRef } from "react";

function About({ goHome }) {
  const countersRef = useRef([]);

  useEffect(() => {
    const targets = [10000, 500, 4.8, 98];
    const labels = ["10K+", "500+", "4.8★", "98%"];

    countersRef.current.forEach((el, i) => {
      if (!el) return;
      let start = 0;
      const end = targets[i];
      const duration = 1800;
      const step = (end / duration) * 16;
      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          el.textContent = labels[i];
          clearInterval(timer);
        } else {
          if (i === 2) el.textContent = start.toFixed(1) + "★";
          else if (i === 0) el.textContent = Math.floor(start / 1000) + "K+";
          else if (i === 3) el.textContent = Math.floor(start) + "%";
          else el.textContent = Math.floor(start) + "+";
        }
      }, 16);
    });
  }, []);

  const values = [
    { icon: "⚡", title: "Speed", desc: "We obsess over delivery times. Every order matters, every minute counts, every meal deserves to arrive hot and on time." },
    { icon: "🌿", title: "Freshness", desc: "Partnered exclusively with restaurants that maintain the highest hygiene and quality standards — because you deserve the best." },
    { icon: "🤝", title: "Trust", desc: "Transparent pricing, real-time tracking, and 24/7 support. We build lasting relationships, not just transactions." },
    { icon: "♻️", title: "Care", desc: "Eco-friendly packaging, sustainable practices, and community-first thinking. We deliver good — to your plate and the planet." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=Cinzel:wght@400;600&display=swap');

        :root {
          --bg-smoky: #0c0c0f;
          --text: #f0eee8;
          --text-muted: #7a7880;
          --border: rgba(255,255,255,0.07);
          --border-hover: rgba(255,255,255,0.16);
          --surface: #101020;
          --surface2: #161628;
        }

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        .ab-page { background: var(--bg-smoky); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        .ab-wrap { max-width: 1160px; margin: 0 auto; padding: 120px 6%; display: flex; flex-direction: column; gap: 120px; }

        /* Hero Section */
        .ab-hero { display:flex; flex-direction: column; align-items: center; justify-content:center; text-align:center; gap: 20px; animation: floatUp 1s ease forwards; }
        .ab-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(5rem, 12vw, 8rem);
          font-weight: 700;
          letter-spacing:-0.03em;
          background: linear-gradient(90deg, #fff, #c0bdd0, #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer2 2s ease-in-out infinite, scaleBounce 2s ease-in-out infinite;
        }
        .ab-intro { font-size: 1.25rem; line-height:1.9; color: var(--text-muted); max-width:700px; animation: fadeUp 1s ease forwards; }

        /* Section */
        .ab-section { animation: fadeUp 1s ease forwards; opacity:0; }

        /* Stats */
        .ab-stats { display:grid; grid-template-columns: repeat(4,1fr); border:1px solid var(--border); border-radius:6px; overflow:hidden; background: var(--surface); }
        .ab-stat { padding:50px 24px; text-align:center; transition: background 0.4s; }
        .ab-stat:hover { background: var(--surface2); }
        .ab-stat-num { font-family:'Cormorant Garamond', serif; font-size:3rem; font-weight:600; background: linear-gradient(135deg, #fff,#a0a0b8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:8px; }
        .ab-stat-label { font-size:0.75rem; letter-spacing:0.2em; color: var(--text-muted); text-transform:uppercase; }

        /* Values */
        .ab-values-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:30px; }
        .ab-value-card { background: var(--surface); border:1px solid var(--border); border-radius:6px; padding:32px; text-align:center; transition: transform 0.4s, background 0.4s; }
        .ab-value-card:hover { transform: translateY(-6px); background: var(--surface2); border-color: var(--border-hover);}
        .ab-value-icon { font-size:2rem; margin-bottom:16px;}
        .ab-value-title { font-family:'Cinzel',serif; font-size:0.8rem; color: var(--text-muted); margin-bottom:12px; text-transform:uppercase; letter-spacing:0.1em; }
        .ab-value-desc { font-size:0.9rem; line-height:1.8; color: var(--text-muted); }

        /* Founder Section */
        .ab-founder { display:flex; flex-direction: column; align-items: center; text-align:center; gap:20px; }
        .ab-founder-avatar { width:120px; height:120px; border-radius:50%; background: rgba(255,255,255,0.05); border:2px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:3rem; transition: transform 0.4s, border-color 0.4s, box-shadow 0.4s; }
        .ab-founder-avatar:hover { transform: scale(1.05); border-color: rgba(255,255,255,0.3); box-shadow:0 0 20px rgba(255,255,255,0.1); }
        .ab-founder-name { font-family:'Cormorant Garamond', serif; font-size:1.5rem; font-weight:600; color: var(--text); }
        .ab-founder-role { font-family:'Cinzel', serif; font-size:0.85rem; letter-spacing:0.2em; color: var(--text-muted); text-transform:uppercase; }
        .ab-founder-desc { max-width:650px; font-size:1rem; line-height:1.8; color: var(--text-muted); }

        /* Footer Button */
        .ab-footer { text-align:center; margin-top:60px; }
        .ab-btn {
          padding:16px 44px; border-radius:6px; background: linear-gradient(135deg,#292930,#18181f);
          color:#fff; font-family:'Cinzel', serif; font-size:0.85rem; letter-spacing:0.2em;
          border:none; cursor:pointer; position:relative; overflow:hidden; transition: all 0.4s ease;
        }
        .ab-btn::before {
          content:'→'; position:absolute; right:16px; top:50%; transform: translateY(-50%) translateX(-10px); opacity:0; transition: all 0.3s ease;
        }
        .ab-btn:hover::before { transform: translateY(-50%) translateX(0); opacity:1; }
        .ab-btn:hover { box-shadow:0 0 25px rgba(255,255,255,0.2); transform: scale(1.05); }

        /* Animations */
        @keyframes fadeUp { from { opacity:0; transform: translateY(30px); } to { opacity:1; transform: translateY(0);} }
        @keyframes shimmer2 { 0%{background-position:-200% center;}50%{background-position:200% center;}100%{background-position:-200% center;} }
        @keyframes floatUp { 0% { transform: translateY(20px); opacity:0;} 100% { transform: translateY(0); opacity:1;} }
        @keyframes scaleBounce { 0%,100%{transform:scale(1);}50%{transform:scale(1.05);} }

        @media(max-width:900px){ .ab-values-grid{grid-template-columns:1fr 1fr;} .ab-stats{grid-template-columns:1fr 1fr;} }
        @media(max-width:600px){ .ab-values-grid{grid-template-columns:1fr;} .ab-stats{grid-template-columns:1fr;} }
      `}</style>

      <div className="ab-page">
        <div className="ab-wrap">

          {/* Hero */}
          <div className="ab-hero">
            <h1 className="ab-title">EATOZ</h1>
            <p className="ab-intro">
              We’re not just a food delivery app. We’re a movement redefining how India eats —
              one delicious, perfectly-timed delivery at a time. Experience seamless delivery
              with elegance, speed, and care.
            </p>
          </div>

          {/* Stats */}
          <div className="ab-section">
            <div className="ab-stats">
              {[
                ["10K+", "Orders Delivered", 0],
                ["500+", "Partner Restaurants", 1],
                ["4.8★", "Customer Rating", 2],
                ["98%", "On-Time Delivery", 3],
              ].map(([fallback, label, i]) => (
                <div className="ab-stat" key={label}>
                  <span className="ab-stat-num" ref={el => countersRef.current[i] = el}>{fallback}</span>
                  <span className="ab-stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Values */}
          <div className="ab-section">
            <div className="ab-values-grid">
              {values.map(v => (
                <div className="ab-value-card" key={v.title}>
                  <div className="ab-value-icon">{v.icon}</div>
                  <div className="ab-value-title">{v.title}</div>
                  <p className="ab-value-desc">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Founder Section */}
          <div className="ab-section ab-founder">
            <div className="ab-founder-avatar">👩‍💻</div>
            <div className="ab-founder-name">Esha Chauhan</div>
            <div className="ab-founder-role">Founder & Developer</div>
            <p className="ab-founder-desc">
              Passionate full-stack developer and the visionary behind EATOZ. Focused on building premium digital experiences that combine modern design, seamless user interaction, and powerful technology. EATOZ was created with the mission to redefine food delivery across India through innovation and elegance.
            </p>
          </div>

          {/* Footer */}
          <div className="ab-footer">
            <button className="ab-btn" onClick={goHome}>Return to Home</button>
          </div>

        </div>
      </div>
    </>
  );
}

export default About;