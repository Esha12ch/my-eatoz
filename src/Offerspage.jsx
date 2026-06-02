import { useState, useEffect, useRef } from "react";
import "./OffersPage.css";

const tickerItems = [
  "Food Delivery", "EatMart Groceries", "Restaurant Dine Out",
  "Exclusive Codes", "Save Instantly", "New Offers Weekly",
  "Food Delivery", "EatMart Groceries", "Restaurant Dine Out",
  "Exclusive Codes", "Save Instantly", "New Offers Weekly",
];

const sectionsData = [
  {
    key: "delivery",
    label: "Food Delivery",
    sublabel: "Delivered to your door",
    offers: [
      { code: "FIRST50",     title: "50% Off First Order",    desc: "Flat 50% off up to ₹100 on your very first food delivery order.", expiry: "31 Mar 2026",  tag: "New User"  },
      { code: "FEAST30",     title: "30% Off Above ₹299",     desc: "Order more, save more. Flat 30% off on all orders above ₹299.",   expiry: "15 Mar 2026",  tag: "Hot Deal"  },
      { code: "FRIDAY20",    title: "Friday 20% Off",         desc: "Every Friday is feast day. 20% off on all deliveries, no minimum.", expiry: "Every Friday", tag: "Weekly"    },
      { code: "LATENIGHT15", title: "Late Night Special",     desc: "Craving after midnight? 15% off on orders placed 11 PM – 2 AM.",  expiry: "Ongoing",      tag: "Night Owl" },
      { code: "COMBO40",     title: "Combo Meal Saver",       desc: "Get 40% off on any combo meal from our premium partners.",         expiry: "28 Feb 2026",  tag: "Combo"     },
      { code: "REORDER10",   title: "Reorder Reward",         desc: "Extra 10% off every time you reorder from your favourite spot.",   expiry: "Ongoing",      tag: "Loyalty"   },
    ],
  },
  {
    key: "eatmart",
    label: "EatMart",
    sublabel: "Groceries & essentials",
    offers: [
      { code: "MART15",    title: "15% Off Groceries",       desc: "Shop fresh from EatMart and save flat 15% on your entire cart.",   expiry: "28 Feb 2026", tag: "Groceries" },
      { code: "BULK200",   title: "₹200 Off on ₹999+",      desc: "Bulk up your pantry. Flat ₹200 off on orders above ₹999.",         expiry: "10 Mar 2026", tag: "Bulk Save" },
      { code: "FRESH10",   title: "Fresh Produce 10% Off",   desc: "Farm-fresh to door. Extra 10% off on all fruits & vegetables.",    expiry: "Ongoing",     tag: "Fresh"     },
      { code: "DAIRY5",    title: "Daily Dairy Deal",        desc: "5% off on all dairy — milk, cheese, curd and more, every day.",    expiry: "Ongoing",     tag: "Daily"     },
      { code: "ORGANIC20", title: "Organic Range 20% Off",   desc: "Go clean and green. 20% off on our certified organic range.",      expiry: "20 Mar 2026", tag: "Organic"   },
      { code: "FIRSTMART", title: "First EatMart Order",     desc: "New to EatMart? Flat ₹150 off on your first grocery order.",       expiry: "31 Mar 2026", tag: "New User"  },
    ],
  },
  {
    key: "dineout",
    label: "Restaurant Dine Out",
    sublabel: "Premium dining experiences",
    offers: [
      { code: "UPIEAT10",   title: "10% Off on UPI Payment",        desc: "Pay cashless via any UPI app — GPay, PhonePe, Paytm — and get instant 10% off on your total dine-in bill.", expiry: "Ongoing",     tag: "UPI Offer"   },
      { code: "TABLEBOOK",  title: "Pre-Book Table, Save ₹200",     desc: "Reserve your table at least 2 hours in advance through EATOZ and get ₹200 off on bills above ₹1000.",       expiry: "31 Mar 2026", tag: "Reservation" },
      { code: "LADIES50",   title: "Complimentary Drink for Girls", desc: "Ladies get one complimentary mocktail or welcome drink on every dine-in visit at our partner restaurants.",  expiry: "Every Day",   tag: "For Her"     },
      { code: "LUNCH15",    title: "Lunch Hour 15% Off",            desc: "Weekday lunch special. Flat 15% off on all dine-in bills between 12 PM and 3 PM at partner outlets.",        expiry: "Mon–Fri",     tag: "Lunch"       },
      { code: "CASHLESS12", title: "Cashless Dining 12% Off",       desc: "Go completely cashless — no cash, no card. Pay via UPI or wallet and enjoy extra 12% off every visit.",     expiry: "Ongoing",     tag: "Cashless"    },
      { code: "BIRTHDAY30", title: "Birthday Treat 30% Off",        desc: "Celebrate your special day with us. Show your birthday ID and get 30% off at all fine-dining partners.",    expiry: "All Year",    tag: "Special"     },
    ],
  },
];

/* ── Floating Particles ── */
function Particles() {
  const particles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1.5,
    left: Math.random() * 100,
    bottom: Math.random() * 20,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 8,
    drift: (Math.random() - 0.5) * 60,
  }));
  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="op-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--drift": `${p.drift}px`,
          }}
        />
      ))}
    </>
  );
}

/* ── Copy Button ── */
function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={`op-card-copy${copied ? " copied" : ""}`}
      onClick={() => {
        navigator.clipboard?.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "✓ Done" : "Copy"}
    </button>
  );
}

/* ── Offer Card ── */
function OfferCard({ offer, index,applycoupon }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("reveal"); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
   <div className="op-card">
      <div className="op-card-top">
        <span className="op-card-tag">{offer.tag}</span>
        <span className="op-card-expiry">{offer.expiry}</span>
      </div>

      <div className="op-card-title">{offer.title}</div>
      <div className="op-card-desc">{offer.desc}</div>

      <div className="op-card-code-row">
        <div className="op-card-code">{offer.code}</div>

        {/* 🔥 APPLY BUTTON */}
        <button
          className="op-card-copy"
          onClick={() => applyCoupon(offer.code)}
        >
          APPLY
        </button>
      </div>
    </div>
  );
}

/* ── Section ── */
function Section({ data }) {
  return (
    <div className="op-section">
      <div className="op-section-header">
        <div>
          <div className="op-section-label">{data.sublabel}</div>
          <div className="op-section-title">
            {data.label.split(" ").map((word, i) =>
              i === 0
                ? <span key={i}>{word} </span>
                : <em key={i}>{word} </em>
            )}
          </div>
        </div>
        <span className="op-section-count">{data.offers.length} offers</span>
      </div>
      <div className="op-grid">
        {data.offers.map((offer, i) => (
          <OfferCard key={offer.code} offer={offer} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function OffersPage({ goHome,applyCoupon }) {
  const [activeTab, setActiveTab] = useState("all");

  const displayed = activeTab === "all"
    ? sectionsData
    : sectionsData.filter(s => s.key === activeTab);

  return (  
    <div className="op-root">
      <div className="op-grain" />

      {/* HERO */}
      <div className="op-hero">
        <div className="op-hero-grid" />
        <div className="op-hero-spotlight" />
        <Particles />

        <button className="op-back" onClick={goHome}>
          ← Back to Home
        </button>

        <div className="op-eyebrow">
          <div className="op-eyebrow-line" />
          <span className="op-eyebrow-text">Exclusive Offers · 2026</span>
          <div className="op-eyebrow-line" />
        </div>

        <h1 className="op-hero-title">
          <span className="word"><span className="word-inner"><em>Best</em></span></span>
          {" "}
          <span className="word"><span className="word-inner">Deals</span></span>
        </h1>

        <p className="op-hero-desc">
          Curated offers across delivery, grocery &amp; fine dining.<br />
          Apply any code at checkout and save instantly.
        </p>
      </div>

      {/* TICKER */}
      <div className="op-ticker-wrap">
        <div className="op-ticker-track">
          {tickerItems.map((item, i) => (
            <span key={i} className="op-ticker-item">
              {item}
              <span className="op-ticker-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="op-tabs">
        {[
          { key: "all", label: "All Offers", count: sectionsData.reduce((a, s) => a + s.offers.length, 0) },
          ...sectionsData.map(s => ({ key: s.key, label: s.label, count: s.offers.length })),
        ].map(tab => (
          <button
            key={tab.key}
            className={`op-tab${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="op-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* SECTIONS */}
      {displayed.map(section => (
        <Section key={section.key} data={section} />
      ))}

      {/* FOOTER */}
      <div className="op-footer">
        <span className="op-footer-brand">EATOZ</span>
        <span className="op-footer-note">All offers subject to terms &amp; conditions</span>
      </div>
    </div>
  );
}