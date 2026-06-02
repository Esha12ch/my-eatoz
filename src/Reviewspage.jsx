import { useState, useMemo, useEffect } from "react";
import "./ReviewsPage.css";

/* ════════════════════════════════════════════
   DATA
════════════════════════════════════════════ */
const CATEGORY_DATA = {
  "Food Delivery": {
    icon: "🛵",
    brands: {
      "Eatoz Food":     { icon: "🍱", items: ["Burger","Pizza","Biryani","Momos","Rolls","Noodles","Sandwich","Pasta","Shawarma","Thali","Sushi","Tacos"] },
      "Eatoz Grocery":  { icon: "🛒", items: ["Grocery","Snacks","Beverages","Dairy","Frozen Food","Bread","Eggs","Fruits","Vegetables","Ice Cream"] },
      "Eatoz Dine Out": { icon: "🍽️", items: ["Chips","Chocolates","Ice Cream","Biscuits","Namkeen","Cookies","Popcorn","Noodles","Instant Food","Juice"] },
    },
  },
  "Restaurant": {
    icon: "🏛️",
    brands: {
      "McDonald's":      { icon: "🍔", items: ["McAloo Tikki","Big Mac","Filet-O-Fish","McSpicy Chicken","McNuggets","McFlurry","French Fries","Happy Meal","Soft Serve"] },
      "Domino's":        { icon: "🍕", items: ["Margherita","Farmhouse Pizza","Peppy Paneer","Chicken Dominator","Garlic Breadsticks","Pasta","Choco Lava Cake","Stuffed Crust"] },
      "KFC":             { icon: "🍗", items: ["Original Recipe","Zinger Burger","Popcorn Chicken","Hot Wings","Rice Bowl","Coleslaw","Krushers","Chicken Strips"] },
      "Burger King":     { icon: "👑", items: ["Whopper","Crispy Veg","Chicken Royale","Double Patty Melt","Onion Rings","Loaded Fries","Veggie Burger","Shake"] },
      "Pizza Hut":       { icon: "🫕", items: ["Pan Pizza","Stuffed Crust","Chicken Supreme","Veggie Paradise","Pasta","Garlic Bread","Wings","Dessert"] },
      "Starbucks":       { icon: "☕", items: ["Caramel Macchiato","Cold Brew","Frappuccino","Americano","Latte","Mocha","Croissant","Cheesecake","Green Tea"] },
      "Barbeque Nation": { icon: "🔥", items: ["Grilled Fish","Mutton Seekh","Paneer Tikka","Prawn Skewer","Live Grill","Buffet Spread","Dessert Counter","Mocktails"] },
      "Subway":          { icon: "🥖", items: ["Veggie Delight","Chicken Teriyaki","BMT Sub","Tuna Sub","Meatball Marinara","Paneer Tikka Sub","Salad Bowl","Cookies"] },
      "Haldiram's":      { icon: "🟡", items: ["Raj Kachori","Dahi Bhalla","Chole Bhature","Aloo Tikki","Lassi","Rasgulla","Gulab Jamun","Thali","Namkeen"] },
      "Social":          { icon: "🍸", items: ["Cocktails","Nachos","Loaded Fries","Pasta","Burger","Wood-fired Pizza","Cheesecake","Mocktails"] },
      "Chaayos":         { icon: "🍵", items: ["Masala Chai","Kadak Chai","Adrak Chai","Cold Brew Tea","Maggi","Paratha","Samosa","Sandwich","Toast"] },
      "Barista":         { icon: "🫖", items: ["Cappuccino","Espresso","Cold Coffee","Frappe","Brownie","Waffles","Sandwich","Iced Tea","Muffin"] },
    },
  },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_DATA);

const INITIAL_REVIEWS = [
  {
    id: 1, name: "Aryan Mehta", avatar: "AM", emoji: "🤩", rating: 5,
    date: "Feb 2025", category: "Food Delivery", brand: "Eatoz Food", item: "Butter Chicken",
    comment: "Absolutely mind-blowing! The butter chicken was like a warm hug from the inside. Arrived piping hot, perfectly packaged. Will order every weekend.",
    tags: ["Quick Delivery","Worth Every Penny","Hot Food"], color: "#c9a230",
  },
  {
    id: 2, name: "Priya Sharma", avatar: "PS", emoji: "😍", rating: 4.5,
    date: "Jan 2025", category: "Food Delivery", brand: "Eatoz Food", item: "Momos",
    comment: "So authentic — felt like I was back in the lanes of Delhi! Packaging was immaculate and the fiery chutney was chef's kiss.",
    tags: ["Authentic Taste","Fast Delivery","Value for Money"], color: "#a07820",
  },
  {
    id: 3, name: "Rahul Verma", avatar: "RV", emoji: "😋", rating: 4,
    date: "Feb 2025", category: "Restaurant", brand: "Domino's", item: "Farmhouse Pizza",
    comment: "Cheesy, crispy, loaded with toppings. Hands down the best thin crust in town. The garlic breadsticks were an unexpected delight.",
    tags: ["Extra Cheese","Must Try","Great Packaging"], color: "#8a8a8a",
  },
  {
    id: 4, name: "Sneha Patel", avatar: "SP", emoji: "🥰", rating: 4.5,
    date: "Jan 2025", category: "Restaurant", brand: "Starbucks", item: "Caramel Macchiato",
    comment: "Perfect Sunday afternoon. The macchiato was silky smooth, the cheesecake paired beautifully. The ambience made it feel truly special.",
    tags: ["Great Ambience","Generous Portions","Highly Recommended"], color: "#b8a090",
  },
  {
    id: 5, name: "Kabir Singh", avatar: "KS", emoji: "🔥", rating: 5,
    date: "Feb 2025", category: "Restaurant", brand: "Barbeque Nation", item: "Live Grill",
    comment: "An absolute fire experience — every skewer perfectly cooked, aromatics dialed in, spice level on point. The buffet spread was staggering.",
    tags: ["Best in City","Perfectly Spiced","Must Try"], color: "#e2c97e",
  },
  {
    id: 6, name: "Nisha Joshi", avatar: "NJ", emoji: "😊", rating: 3.5,
    date: "Dec 2024", category: "Food Delivery", brand: "Eatoz Grocery", item: "Snacks",
    comment: "Decent experience overall. The snacks were fresh but delivery took a bit longer than expected. Good value for what you pay.",
    tags: ["Healthy Option","Value for Money","Decent Service"], color: "#707070",
  },
];

const AVATAR_COLORS = ["#c9a230","#a07820","#8a8a8a","#b8a090","#e2c97e","#707070","#d4b870","#c0c0c0"];

const MOOD_OPTIONS = [
  { emoji:"🤩", label:"Amazing"  }, { emoji:"😍", label:"Loved it" },
  { emoji:"😋", label:"Tasty"    }, { emoji:"🥰", label:"Cozy"     },
  { emoji:"😊", label:"Good"     }, { emoji:"😐", label:"Okay"     },
  { emoji:"😕", label:"Meh"      }, { emoji:"🔥", label:"Fire!"    },
];

const QUICK_TAGS = [
  "Fast Delivery","Worth Every Penny","Hot Food","Great Packaging",
  "Authentic Taste","Value for Money","Generous Portions","Must Try",
  "Spicy","Healthy Option","Fresh Ingredients","Highly Recommended",
];

/* ════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════ */
function computeStats(reviews) {
  const total = reviews.length;
  if (!total) return { average: 0, total: 0, breakdown: [] };
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;
  const counts = { 5:0, 4:0, 3:0, 2:0, 1:0 };
  reviews.forEach(r => { const k = Math.round(r.rating); if (counts[k] !== undefined) counts[k]++; });
  return {
    average: Math.round(avg * 10) / 10,
    total,
    breakdown: [5,4,3,2,1].map(s => ({ stars:s, percent: Math.round((counts[s]/total)*100) })),
  };
}

function loadReviews() {
  try {
    const s = localStorage.getItem("eatoz_reviews_v1");
    if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length) return p; }
  } catch (_) {}
  return INITIAL_REVIEWS;
}

/* ════════════════════════════════════════════
   STAR DISPLAY
════════════════════════════════════════════ */
function StarRating({ rating, size = 18 }) {
  return (
    <span className="star-row">
      {[1,2,3,4,5].map(i => {
        const fill = Math.min(Math.max(rating-(i-1), 0), 1);
        return (
          <span key={i} className="star-wrap" style={{ width:size, height:size }}>
            <svg width={size} height={size} viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            {fill > 0 && (
              <span className="star-fill" style={{ width:`${fill*100}%` }}>
                <svg width={size} height={size} viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="#c9a230" stroke="#e2c97e" strokeWidth="0.8" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

/* ════════════════════════════════════════════
   STAR PICKER
════════════════════════════════════════════ */
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  const labels  = ["","Terrible","Bad","Okay","Good","Excellent!"];
  return (
    <div className="star-picker">
      <div className="star-picker-stars">
        {[1,2,3,4,5].map(i => (
          <span key={i}
            className={`star-picker-star ${display>=i?"lit":""}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i)}>
            <svg width={36} height={36} viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={display>=i ? "#c9a230" : "rgba(255,255,255,0.06)"}
                stroke={display>=i ? "#e2c97e" : "rgba(255,255,255,0.1)"}
                strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </span>
        ))}
      </div>
      <span className={`star-picker-label ${display?"active":""}`}>{labels[display]||"Tap to rate"}</span>
    </div>
  );
}

/* ════════════════════════════════════════════
   WRITE REVIEW MODAL  —  4 Steps
════════════════════════════════════════════ */
function WriteReviewModal({ onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:"", category:"", brand:"", item:"", rating:0, mood:"", comment:"", tags:[] });
  const [errors, setErrors] = useState({});

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const brandsForCat  = form.category ? Object.keys(CATEGORY_DATA[form.category]?.brands || {}) : [];
  const itemsForBrand = (form.category && form.brand) ? CATEGORY_DATA[form.category]?.brands[form.brand]?.items || [] : [];
  const brandIcon     = (form.category && form.brand) ? CATEGORY_DATA[form.category]?.brands[form.brand]?.icon || "" : "";

  const toggleTag = tag => up("tags",
    form.tags.includes(tag)
      ? form.tags.filter(t => t !== tag)
      : form.tags.length < 4 ? [...form.tags, tag] : form.tags
  );

  const validate = {
    1: () => { const e={}; if (!form.name.trim()) e.name="Please enter your name"; setErrors(e); return !Object.keys(e).length; },
    2: () => { const e={}; if (!form.category) e.category="Please choose a category"; setErrors(e); return !Object.keys(e).length; },
    3: () => { const e={}; if (!form.brand) e.brand="Please select a brand or restaurant"; setErrors(e); return !Object.keys(e).length; },
    4: () => {
      const e={};
      if (!form.item)                         e.item="Please select an item";
      if (!form.rating)                       e.rating="Please give a star rating";
      if (!form.mood)                         e.mood="Please pick a mood";
      if (form.comment.trim().length < 10)    e.comment="Write at least 10 characters";
      setErrors(e); return !Object.keys(e).length;
    },
  };

  const next = () => {
    if (validate[step]()) {
      if (step < 4) { setErrors({}); setStep(s => s+1); }
      else { onSubmit(form); setStep(5); }
    }
  };
  const back = () => { setErrors({}); setStep(s => s-1); };

  const headerCopy = {
    1: { step:"Step 1 of 4", title:"Who are you?",      sub:"Let's start with your name" },
    2: { step:"Step 2 of 4", title:"Choose category",   sub:"Food delivery or dine-in?" },
    3: { step:"Step 3 of 4", title:"Pick a brand",      sub:"Which brand or restaurant?" },
    4: { step:"Step 4 of 4", title:"Rate & review",     sub:"Tell us about your experience" },
    5: { step:"Done!",       title:"Review posted!",    sub:"Your review is now live" },
  };
  const hc = headerCopy[step];

  return (
    <div className="wr-overlay" onClick={onClose}>
      <div className="wr-modal" onClick={e => e.stopPropagation()}>

        {/* ── HEADER ── */}
        <div className="wr-header">
          <div className="wr-step-track">
            {[1,2,3,4].map(s => (
              <div key={s} className={`wr-dot ${s < step || step===5 ? "done" : s===step ? "active" : ""}`}/>
            ))}
          </div>
          <div className="wr-step-num">{hc.step}</div>
          <div className="wr-title">{hc.title}</div>
          <div className="wr-subtitle">{hc.sub}</div>
          <button className="wr-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</button>
        </div>

        {/* ── STEP 1: Name ── */}
        {step === 1 && (
          <>
            <div className="wr-body">
              <div className="wr-field">
                <label className="wr-label">Your Name</label>
                <input className="wr-input" placeholder="e.g. Rahul Sharma"
                  value={form.name} onChange={e => up("name", e.target.value)}
                  onKeyDown={e => e.key==="Enter" && next()} autoFocus/>
                {errors.name && <div className="wr-error">⚠ {errors.name}</div>}
              </div>
              <div className="wr-name-hint">
                <span className="wr-hint-icon">✦</span>
                Your name will appear publicly on your review
              </div>
            </div>
            <div className="wr-footer">
              <button className="wr-next" onClick={(e) => { e.stopPropagation(); next(); }}>Continue →</button>
            </div>
          </>
        )}

        {/* ── STEP 2: Category ── */}
        {step === 2 && (
          <>
            <div className="wr-body">
              <div className="wr-field">
                <label className="wr-label">Select Category</label>
                <div className="category-grid">
                  {ALL_CATEGORIES.map(cat => (
                    <button key={cat}
                      className={`category-card ${form.category===cat?"sel":""}`}
                      onClick={() => { up("category", cat); up("brand",""); up("item",""); }}>
                      <span className="cat-icon">{CATEGORY_DATA[cat].icon}</span>
                      <span className="cat-label">{cat}</span>
                      <span className="cat-count">{Object.keys(CATEGORY_DATA[cat].brands).length} options</span>
                    </button>
                  ))}
                </div>
                {errors.category && <div className="wr-error">⚠ {errors.category}</div>}
              </div>
            </div>
            <div className="wr-footer">
              <button className="wr-back" onClick={(e) => { e.stopPropagation(); back(); }}>← Back</button>
              <button className="wr-next" onClick={(e) => { e.stopPropagation(); next(); }}>Continue →</button>
            </div>
          </>
        )}

        {/* ── STEP 3: Brand ── */}
        {step === 3 && (
          <>
            <div className="wr-body">
              <div className="wr-field">
                <label className="wr-label">
                  {form.category==="Restaurant" ? "Select Restaurant" : "Select Platform"}
                </label>
                <div className="brand-grid">
                  {brandsForCat.map(brand => (
                    <button key={brand}
                      className={`brand-card ${form.brand===brand?"sel":""}`}
                      onClick={() => { up("brand", brand); up("item",""); }}>
                      <span className="brand-icon">{CATEGORY_DATA[form.category].brands[brand].icon}</span>
                      <span className="brand-name">{brand}</span>
                    </button>
                  ))}
                </div>
                {errors.brand && <div className="wr-error">⚠ {errors.brand}</div>}
              </div>
            </div>
            <div className="wr-footer">
              <button className="wr-back" onClick={(e) => { e.stopPropagation(); back(); }}>← Back</button>
              <button className="wr-next" onClick={(e) => { e.stopPropagation(); next(); }}>Continue →</button>
            </div>
          </>
        )}

        {/* ── STEP 4: Item + Rating + Review ── */}
        {step === 4 && (
          <>
            <div className="wr-body">
              <div className="context-pill">
                <span>{CATEGORY_DATA[form.category]?.icon}</span>
                <span className="ctx-brand">{brandIcon} {form.brand}</span>
                <span className="ctx-sep">·</span>
                <span className="ctx-cat">{form.category}</span>
              </div>

              <div className="wr-field">
                <label className="wr-label">
                  {form.category==="Restaurant" ? "Select Dish / Experience" : "Select Item Ordered"}
                </label>
                <div className="item-grid">
                  {itemsForBrand.map(item => (
                    <button key={item}
                      className={`item-btn ${form.item===item?"sel":""}`}
                      onClick={() => up("item", item)}>
                      {item}
                    </button>
                  ))}
                </div>
                {errors.item && <div className="wr-error">⚠ {errors.item}</div>}
              </div>

              <div className="wr-field">
                <label className="wr-label">Overall Rating</label>
                <div className="rating-box">
                  <StarPicker value={form.rating} onChange={v => up("rating", v)}/>
                </div>
                {errors.rating && <div className="wr-error">⚠ {errors.rating}</div>}
              </div>

              <div className="wr-field">
                <label className="wr-label">Your Mood</label>
                <div className="mood-grid">
                  {MOOD_OPTIONS.map(m => (
                    <button key={m.emoji}
                      className={`mood-btn ${form.mood===m.emoji?"sel":""}`}
                      onClick={() => up("mood", m.emoji)}>
                      <span className="m-emoji">{m.emoji}</span>
                      <span className="m-label">{m.label}</span>
                    </button>
                  ))}
                </div>
                {errors.mood && <div className="wr-error">⚠ {errors.mood}</div>}
              </div>

              <div className="wr-field">
                <label className="wr-label">Your Review</label>
                <textarea className="wr-input wr-textarea"
                  placeholder="What did you love? What could be better? Be honest…"
                  value={form.comment} maxLength={300}
                  onChange={e => up("comment", e.target.value)}/>
                <div className="char-count">{form.comment.length} / 300</div>
                {errors.comment && <div className="wr-error">⚠ {errors.comment}</div>}
              </div>

              <div className="wr-field">
                <label className="wr-label">
                  Quick Tags <span className="wr-label-note">(choose up to 4)</span>
                </label>
                <div className="tag-grid">
                  {QUICK_TAGS.map(t => (
                    <button key={t}
                      className={`tag-btn ${form.tags.includes(t)?"sel":""}`}
                      onClick={() => toggleTag(t)}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="wr-footer">
              <button className="wr-back" onClick={(e) => { e.stopPropagation(); back(); }}>← Back</button>
              <button className="wr-next" onClick={(e) => { e.stopPropagation(); next(); }}>Submit Review ✓</button>
            </div>
          </>
        )}

        {/* ── STEP 5: Success ── */}
        {step === 5 && (
          <div className="wr-success">
            <div className="s-icon">{form.mood || "🎉"}</div>
            <div className="s-title">Review posted!</div>
            <div className="s-stars"><StarRating rating={form.rating} size={22}/></div>
            <p className="s-sub">
              Thank you, <strong className="s-name">{form.name}</strong>. Your review of{" "}
              <strong className="s-bold">{form.item}</strong> at{" "}
              <strong className="s-bold">{form.brand}</strong> is now live and helping others discover great food.
            </p>
            <button className="s-done" onClick={(e) => { e.stopPropagation(); onClose(); }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function ReviewsPage({ onClose }) {
  const [filter,    setFilter]    = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [reviews,   setReviews]   = useState(loadReviews);
  const [showModal, setShowModal] = useState(false);
  const [newId,     setNewId]     = useState(null);

  const stats = useMemo(() => computeStats(reviews), [reviews]);

  useEffect(() => {
    try { localStorage.setItem("eatoz_reviews_v1", JSON.stringify(reviews)); } catch(_) {}
  }, [reviews]);

  const handleSubmit = (form) => {
    const initials = form.name.trim().split(" ").map(w => w[0].toUpperCase()).slice(0,2).join("");
    const color    = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const date     = new Date().toLocaleString("en-IN", { month:"short", year:"numeric" });
    const id       = Date.now();
    setNewId(id);
    setReviews(prev => [{
      id, name: form.name.trim(), avatar: initials, emoji: form.mood||"😊",
      rating: form.rating, date, category: form.category, brand: form.brand,
      item: form.item, comment: form.comment.trim(), tags: form.tags, color,
    }, ...prev]);
  };

  const starFilters = ["All","5 ⭐","4 ⭐","3 ⭐"];
  const catFilters  = ["All", ...ALL_CATEGORIES];

  const filtered = reviews.filter(r => {
    const starOk = filter==="All" || Math.floor(r.rating)===parseInt(filter);
    const catOk  = catFilter==="All" || r.category===catFilter;
    return starOk && catOk;
  });

  return (
    <>
      <div className="reviews-overlay">
        <div className="reviews-panel">

          {/* ── HERO ── */}
          <div className="reviews-hero">
            <button className="rp-close-btn" onClick={onClose} title="Close">✕</button>
            <div className="hero-eyebrow">Customer Voices</div>
            <h1 className="hero-title">Reviews <em>&</em> Ratings</h1>
            <p className="hero-subtitle">Real reviews from real food lovers across India</p>

            <div className="score-block">
              <div className="big-score">
                <div className="big-number">{stats.average || "—"}</div>
                <div className="big-stars"><StarRating rating={stats.average} size={24}/></div>
                <div className="big-total">{stats.total} {stats.total===1?"review":"reviews"}</div>
              </div>
              <div className="breakdown">
                {stats.breakdown.map(b => (
                  <div className="bar-row" key={b.stars}>
                    <span className="bar-label">{b.stars}★</span>
                    <div className="bar-track">
                      <div className="bar-fill"
                        key={`${b.stars}-${b.percent}`}
                        style={{ "--bar-w":`${b.percent}%`, width:`${b.percent}%` }}/>
                    </div>
                    <span className="bar-pct">{b.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FILTERS ── */}
          <div className="filter-section">
            <div className="filter-row">
              <span className="filter-label">Category</span>
              {catFilters.map(f => (
                <button key={f}
                  className={`filter-pill ${catFilter===f?"active":""}`}
                  onClick={() => setCatFilter(f)}>
                  {f!=="All" && <span className="pill-icon">{CATEGORY_DATA[f]?.icon}</span>}
                  {f}
                </button>
              ))}
            </div>
            <div className="filter-row filter-row-stars">
              <span className="filter-label">Rating</span>
              {starFilters.map(f => (
                <button key={f}
                  className={`filter-pill ${filter===f?"active":""}`}
                  onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
          </div>

          {/* ── CARDS GRID ── */}
          <div className="reviews-grid">
            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-text">No reviews match this filter</div>
              </div>
            )}
            {filtered.map((r, i) => (
              <div key={r.id}
                className={`review-card ${r.id===newId?"is-new":""}`}
                style={{ "--accent": r.color, "--avatar-color": r.color, animationDelay:`${Math.min(i,8)*0.06}s` }}>

                {/* Decorative quote mark */}
                <div className="card-quote-mark">"</div>

                <div className="card-top">
                  <div className="avatar" style={{ background: `linear-gradient(135deg, ${r.color}cc, ${r.color}66)`, borderColor: `${r.color}44` }}>{r.avatar}</div>
                  <div className="card-meta">
                    <div className="card-name">
                      {r.name}
                      {r.id===newId && <span className="new-badge">New</span>}
                    </div>
                    <div className="card-hierarchy">
                      {r.category && <span className="card-cat-tag">{CATEGORY_DATA[r.category]?.icon} {r.category}</span>}
                      {r.brand && (
                        <>
                          <span className="card-sep">›</span>
                          <span className="card-brand">{r.brand}</span>
                        </>
                      )}
                      {r.item && (
                        <>
                          <span className="card-sep">›</span>
                          <span className="card-dish">{r.item}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="emoji-badge">{r.emoji}</div>
                </div>

                <div className="card-stars-row">
                  <StarRating rating={r.rating} size={15}/>
                  <span className="card-rating-num">{r.rating}</span>
                  <span className="card-date">{r.date}</span>
                </div>

                <p className="card-comment">{r.comment}</p>

                {r.tags.length > 0 && (
                  <div className="card-tags">
                    {r.tags.map(t => <span className="tag" key={t}>{t}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <div className="write-review-cta">
            <span className="cta-emoji">✍️</span>
            <div className="cta-title">Loved your meal?</div>
            <p className="cta-sub">Share your experience and help others discover great food across India</p>
            <button className="cta-btn" onClick={() => setShowModal(true)}>Write a Review</button>
          </div>

        </div>
      </div>

      {showModal && (
        <WriteReviewModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}/>
      )}
    </>
  );
}