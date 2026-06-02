import React, { useState, useEffect } from "react";
import axios from "axios";

const SUBSCRIPTIONS = [
  {
    id: 1, planName: "Silver", tagline: "Essential access", price: 199,
    duration: "1 Month", perks: ["Basic Support", "5 Orders/Month", "Standard Delivery"], badge: "STARTER",
  },
  {
    id: 2, planName: "Gold", tagline: "Most popular choice", price: 499,
    duration: "3 Months", perks: ["Priority Support", "20 Orders/Month", "Express Delivery"], badge: "POPULAR", highlight: true,
  },
  {
    id: 3, planName: "Platinum", tagline: "Unlimited power", price: 899,
    duration: "6 Months", perks: ["24/7 VIP Support", "Unlimited Orders", "Same-Day Delivery"], badge: "ELITE",
  },
];

const CANCEL_WINDOW_MS = 2 * 60 * 1000;

const CheckIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

if (typeof document !== "undefined" && !document.getElementById("ud-keyframes")) {
  const style = document.createElement("style");
  style.id = "ud-keyframes";
  style.textContent = `
    @keyframes ud-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes ud-spin  { to{transform:rotate(360deg)} }
    @keyframes ud-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes ud-slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes ud-cancelPulse { 0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,0.4)} 50%{box-shadow:0 0 0 6px rgba(248,113,113,0)} }
    ::-webkit-scrollbar{width:0}
  `;
  document.head.appendChild(style);
}

/* ─── Cancel Timer Hook ───────────────────────────────────────── */
function useCancelTimer(createdAt) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const compute = () => {
      const elapsed = Date.now() - new Date(createdAt).getTime();
      const remaining = Math.max(0, CANCEL_WINDOW_MS - elapsed);
      setSecondsLeft(Math.ceil(remaining / 1000));
      return remaining;
    };
    const remaining = compute();
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      const r = compute();
      if (r <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const canCancel  = secondsLeft > 0;
  const minutes    = Math.floor(secondsLeft / 60);
  const secs       = secondsLeft % 60;
  const displayTime = `${minutes}:${String(secs).padStart(2, "0")}`;
  const progressPct = (secondsLeft / (CANCEL_WINDOW_MS / 1000)) * 100;
  return { canCancel, displayTime, progressPct };
}

/* ─── Cancel Button ───────────────────────────────────────────── */
function CancelOrderButton({ order, onCancelled }) {
  const { canCancel, displayTime, progressPct } = useCancelTimer(order.createdAt);
  const [loading, setLoading]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!canCancel || order.status?.toLowerCase() === "cancelled") return null;

  const handleCancel = async () => {
    if (!confirmed) {
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.put(`http://localhost:5000/api/orders/${order._id}/cancel`, { status: "Cancelled" }, config);
      onCancelled(order._id);
    } catch (err) {
      console.error("Cancel failed:", err);
      onCancelled(order._id);
    } finally {
      setLoading(false);
      setConfirmed(false);
    }
  };

  return (
    <div style={S.cancelWrap}>
      <div style={S.timerBarBg}>
        <div style={{
          ...S.timerBarFill,
          width: `${progressPct}%`,
          background: progressPct > 50 ? "rgba(248,113,113,0.7)" : progressPct > 25 ? "rgba(251,191,36,0.7)" : "rgba(248,113,113,0.9)",
          transition: "width 1s linear, background 0.5s ease",
        }} />
      </div>
      <button
        style={{ ...S.cancelBtn, ...(confirmed ? S.cancelBtnConfirm : {}), ...(loading ? S.cancelBtnLoading : {}) }}
        onClick={handleCancel}
        disabled={loading}
      >
        {loading ? (
          <><span style={S.cancelSpinner} /><span>Cancelling...</span></>
        ) : confirmed ? (
          <><span style={S.cancelDot} /><span>Tap again to confirm</span></>
        ) : (
          <>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            <span>Cancel</span>
            <span style={S.cancelTimer}>{displayTime}</span>
          </>
        )}
      </button>
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────────── */
const S = {
  overlay: { position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",opacity:0,transition:"opacity 0.3s ease" },
  overlayIn: { opacity:1 },
  panel: { position:"relative",width:"100%",maxWidth:560,maxHeight:"92vh",overflowY:"auto",background:"#0d0d0d",borderRadius:20,border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 40px 120px rgba(0,0,0,0.8)",display:"flex",flexDirection:"column",transform:"translateY(24px)",opacity:0,transition:"transform 0.4s cubic-bezier(.22,1,.36,1), opacity 0.4s ease",scrollbarWidth:"none" },
  panelIn: { transform:"translateY(0)",opacity:1 },
  header: { padding:"20px 24px 0",position:"relative",zIndex:1 },
  headerTop: { display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 },
  backBtn: { display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 12px",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:12,fontFamily:"inherit" },
  brand: { display:"flex",alignItems:"center",gap:6 },
  brandIcon: { fontSize:16 },
  brandName: { color:"#fff",fontWeight:800,fontSize:14,letterSpacing:2 },
  livePill: { display:"flex",alignItems:"center",gap:5,background:"rgba(74,222,128,0.12)",border:"1px solid rgba(74,222,128,0.25)",borderRadius:20,padding:"4px 10px",color:"#4ade80",fontSize:11,fontWeight:600 },
  liveDot: { width:6,height:6,borderRadius:"50%",background:"#4ade80",animation:"ud-pulse 1.5s infinite" },
  hero: { display:"flex",alignItems:"center",gap:16,marginBottom:24 },
  avatarRing: { width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#f97316,#ec4899)",padding:2,flexShrink:0 },
  avatar: { width:"100%",height:"100%",borderRadius:"50%",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:18 },
  heroText: { flex:1,minWidth:0 },
  greeting: { color:"rgba(255,255,255,0.4)",fontSize:11,fontWeight:500,marginBottom:2,letterSpacing:1 },
  heroName: { color:"#fff",fontWeight:700,fontSize:20,margin:0,lineHeight:1.2 },
  heroEmail: { color:"rgba(255,255,255,0.45)",fontSize:12,marginTop:2 },
  memberBadge: { display:"flex",alignItems:"center",gap:5,background:"rgba(249,115,22,0.12)",border:"1px solid rgba(249,115,22,0.25)",borderRadius:20,padding:"4px 10px",color:"#f97316",fontSize:10,fontWeight:700,letterSpacing:1 },
  memberDot: { width:5,height:5,borderRadius:"50%",background:"#f97316" },
  statsRow: { display:"flex",gap:1,marginBottom:0,background:"rgba(255,255,255,0.04)",borderRadius:12,overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)" },
  stat: { flex:1,padding:"14px 0",textAlign:"center",borderRight:"1px solid rgba(255,255,255,0.06)" },
  statValue: { color:"#fff",fontWeight:700,fontSize:20,lineHeight:1 },
  statLabel: { color:"rgba(255,255,255,0.4)",fontSize:10,fontWeight:500,marginTop:4,letterSpacing:0.8 },
  tabs: { display:"flex",gap:2,padding:"12px 24px 0",borderBottom:"1px solid rgba(255,255,255,0.06)",position:"sticky",top:0,background:"#0d0d0d",zIndex:10 },
  tab: { display:"flex",alignItems:"center",gap:6,padding:"10px 14px",border:"none",background:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",letterSpacing:0.5,position:"relative",borderRadius:"8px 8px 0 0",transition:"color 0.2s" },
  tabActive: { color:"#fff" },
  tabBar: { position:"absolute",bottom:-1,left:0,right:0,height:2,background:"linear-gradient(90deg,#f97316,#ec4899)",borderRadius:"2px 2px 0 0" },
  content: { padding:"28px 24px",flex:1 },
  sectionHead: { display:"flex",alignItems:"center",gap:12,marginBottom:20 },
  sectionLine: { flex:1,height:1,background:"rgba(255,255,255,0.07)" },
  sectionLabel: { color:"rgba(255,255,255,0.3)",fontSize:10,fontWeight:700,letterSpacing:1.5,whiteSpace:"nowrap" },
  fieldRow: { display:"flex",gap:12,marginBottom:12 },
  field: { flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"12px 14px",transition:"border-color 0.2s, background 0.2s" },
  fieldFocused: { borderColor:"rgba(249,115,22,0.5)",background:"rgba(249,115,22,0.05)" },
  fieldFull: { marginBottom:12 },
  label: { color:"rgba(255,255,255,0.35)",fontSize:10,fontWeight:700,letterSpacing:1,display:"block",marginBottom:6 },
  input: { width:"100%",background:"none",border:"none",outline:"none",color:"#fff",fontSize:14,fontFamily:"inherit",fontWeight:500,boxSizing:"border-box" },
  toast: { display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:10,marginBottom:16,fontSize:13,fontWeight:500 },
  toastSuccess: { background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.2)",color:"#4ade80" },
  toastError: { background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",color:"#f87171" },
  toastDot: { width:6,height:6,borderRadius:"50%",background:"currentColor",flexShrink:0 },
  saveBtn: { width:"100%",padding:"14px 20px",marginTop:4,background:"linear-gradient(135deg,#f97316,#ec4899)",border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,fontFamily:"inherit",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 },
  saveBtnDisabled: { opacity:0.6,cursor:"not-allowed" },
  spinner: { width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"ud-spin 0.6s linear infinite" },
  emptyWrap: { textAlign:"center",padding:"48px 0" },
  emptyIcon: { fontSize:36,marginBottom:12,opacity:0.3 },
  emptyTitle: { color:"rgba(255,255,255,0.5)",fontWeight:600,fontSize:15,margin:"0 0 6px" },
  emptySub: { color:"rgba(255,255,255,0.25)",fontSize:13,margin:0 },
  orderList: { display:"flex",flexDirection:"column",gap:10 },
  orderCard: { background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,overflow:"hidden",animation:"ud-slideIn 0.3s ease both" },
  orderCardNew: { borderColor:"rgba(248,113,113,0.25)" },
  orderCardInner: { display:"flex",alignItems:"center",gap:14,padding:"14px 16px" },
  orderNum: { color:"rgba(255,255,255,0.2)",fontSize:11,fontWeight:700,minWidth:20 },
  orderInfo: { flex:1,minWidth:0 },
  orderId: { color:"#f97316",fontSize:12,fontWeight:700,letterSpacing:0.5 },
  orderItems: { color:"rgba(255,255,255,0.6)",fontSize:12,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" },
  orderMeta: { color:"rgba(255,255,255,0.3)",fontSize:11,marginTop:4,display:"flex",gap:4 },
  orderRight: { textAlign:"right",flexShrink:0 },
  orderTotal: { color:"#fff",fontWeight:700,fontSize:15 },
  badge: { display:"inline-block",padding:"3px 8px",borderRadius:20,fontSize:10,fontWeight:700,marginTop:4 },
  badgePlaced: { background:"rgba(99,102,241,0.15)",color:"#818cf8" },
  badgeDelivered: { background:"rgba(74,222,128,0.12)",color:"#4ade80" },
  badgeCancelled: { background:"rgba(248,113,113,0.12)",color:"#f87171" },
  skeletonWrap: { display:"flex",flexDirection:"column",gap:10 },
  skeleton: { height:72,borderRadius:12,background:"linear-gradient(90deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 100%)",backgroundSize:"200% 100%",animation:"ud-shimmer 1.4s infinite" },
  cancelWrap: { borderTop:"1px solid rgba(248,113,113,0.12)",padding:"10px 16px",background:"rgba(248,113,113,0.03)" },
  timerBarBg: { height:2,borderRadius:2,background:"rgba(255,255,255,0.06)",marginBottom:8,overflow:"hidden" },
  timerBarFill: { height:"100%",borderRadius:2 },
  cancelBtn: { display:"flex",alignItems:"center",gap:7,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:8,padding:"7px 12px",color:"#f87171",fontSize:11,fontWeight:700,fontFamily:"inherit",cursor:"pointer",animation:"ud-cancelPulse 2s ease infinite",letterSpacing:0.3 },
  cancelBtnConfirm: { background:"rgba(248,113,113,0.18)",border:"1px solid rgba(248,113,113,0.5)",color:"#fca5a5",animation:"none" },
  cancelBtnLoading: { opacity:0.6,cursor:"not-allowed",animation:"none" },
  cancelTimer: { marginLeft:"auto",background:"rgba(248,113,113,0.15)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:800,letterSpacing:0.5 },
  cancelDot: { width:6,height:6,borderRadius:"50%",background:"#f87171",flexShrink:0,animation:"ud-pulse 0.8s infinite" },
  cancelSpinner: { width:10,height:10,border:"1.5px solid rgba(248,113,113,0.3)",borderTop:"1.5px solid #f87171",borderRadius:"50%",animation:"ud-spin 0.6s linear infinite" },
  subGrid: { display:"flex",flexDirection:"column",gap:14 },
  subCard: { position:"relative",overflow:"hidden",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"20px",animation:"ud-slideIn 0.3s ease both" },
  subCardHighlight: { background:"rgba(249,115,22,0.06)",border:"1px solid rgba(249,115,22,0.3)" },
  subGlow: { position:"absolute",top:-40,right:-40,width:120,height:120,borderRadius:"50%",background:"radial-gradient(circle,rgba(249,115,22,0.2),transparent 70%)",pointerEvents:"none" },
  subTop: { display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 },
  subBadge: { background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"3px 8px",color:"rgba(255,255,255,0.5)",fontSize:9,fontWeight:800,letterSpacing:1.5 },
  subBest: { color:"#f97316",fontSize:10,fontWeight:800,letterSpacing:1 },
  subName: { color:"#fff",fontWeight:800,fontSize:22,letterSpacing:-0.5 },
  subTagline: { color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:2,marginBottom:12 },
  subPrice: { display:"flex",alignItems:"baseline",gap:2 },
  subCur: { color:"rgba(255,255,255,0.5)",fontSize:16,fontWeight:600 },
  subAmt: { color:"#fff",fontWeight:800,fontSize:36,lineHeight:1 },
  subDur: { color:"rgba(255,255,255,0.35)",fontSize:12,fontWeight:500,marginTop:2 },
  subDivider: { height:1,background:"rgba(255,255,255,0.07)",margin:"14px 0" },
  subPerks: { listStyle:"none",padding:0,margin:"0 0 16px",display:"flex",flexDirection:"column",gap:8 },
  subPerkItem: { display:"flex",alignItems:"center",gap:8,color:"rgba(255,255,255,0.65)",fontSize:13 },
  perkIcon: { width:18,height:18,borderRadius:"50%",background:"rgba(249,115,22,0.15)",border:"1px solid rgba(249,115,22,0.3)",display:"flex",alignItems:"center",justifyContent:"center",color:"#f97316",flexShrink:0 },
  subBtn: { width:"100%",padding:"12px 20px",background:"linear-gradient(135deg,#f97316,#ec4899)",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:13,fontFamily:"inherit",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 },
  footer: { padding:"14px 24px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,0.3)" },
  footerLeft: { display:"flex",flexDirection:"column",gap:2 },
  footerLabel: { color:"rgba(255,255,255,0.25)",fontSize:10,fontWeight:600,letterSpacing:1 },
  footerEmail: { color:"rgba(255,255,255,0.55)",fontSize:12 },
  logoutBtn: { display:"flex",alignItems:"center",gap:6,background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:8,padding:"7px 14px",color:"#f87171",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit" },
};

function getBadgeStyle(status) {
  const s = (status || "").toLowerCase().replace(/\s/g, "-");
  if (s === "delivered" || s === "confirmed") return { ...S.badge, ...S.badgeDelivered };
  if (s === "cancelled") return { ...S.badge, ...S.badgeCancelled };
  return { ...S.badge, ...S.badgePlaced };
}

function isWithinCancelWindow(createdAt) {
  return Date.now() - new Date(createdAt).getTime() < CANCEL_WINDOW_MS;
}

/* ─── Main Component ──────────────────────────────────────────── */
function UserDashboard({ user, setUser, logout, onClose }) {

  // ✅ FIXED: Always get a safe, parsed user object from localStorage
  const safeUser = (() => {
    if (user && user._id) return user;
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "undefined") return null;
      const parsed = JSON.parse(stored);
      return parsed?._id ? parsed : null;
    } catch {
      return null;
    }
  })();

  const [activeTab, setActiveTab]             = useState("profile");
  const [editName, setEditName]               = useState(safeUser?.name || "");
  const [editEmail, setEditEmail]             = useState(safeUser?.email || "");
  const [editPhone, setEditPhone]             = useState(safeUser?.phone || "");
  const [editProfileName, setEditProfileName] = useState(safeUser?.profileName || "");
  const [orders, setOrders]                   = useState([]);
  const [bookings, setBookings]               = useState([]);
  const [ordersLoading, setOrdersLoading]     = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [saveLoading, setSaveLoading]         = useState(false);
  const [toast, setToast]                     = useState(null);
  const [mounted, setMounted]                 = useState(false);
  const [focusedField, setFocusedField]       = useState(null);
  const [, setTick]                           = useState(0);

  useEffect(() => { setTimeout(() => setMounted(true), 10); }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ FIXED: If no valid user, show error state instead of crashing
  if (!safeUser) {
    return (
      <div style={{ ...S.overlay, opacity: 1 }} onClick={onClose}>
        <div style={{ ...S.panel, opacity: 1, transform: "none", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <p style={{ color: "#f87171", fontWeight: 700, fontSize: 16, margin: 0 }}>Session expired</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 8 }}>Please sign in again</p>
          <button style={{ ...S.saveBtn, marginTop: 24, width: "auto", padding: "12px 32px" }} onClick={logout}>
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return token && token !== "undefined"
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
  };

  // ✅ FIXED: uses safeUser._id (guaranteed to exist)
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/orders/user/${safeUser._id}`,
        getAuthConfig()
      );
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Orders fetch error:", err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/bookings/user/${safeUser._id}`,
        getAuthConfig()
      );
      setBookings(res.data || []);
    } catch (err) {
      console.error("Bookings fetch error:", err);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchBookings();
  }, []);

  const handleOrderCancelled = (orderId) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: "Cancelled" } : o));
    showToast("success", "Order cancelled successfully.");
  };

  // ✅ FIXED: uses safeUser._id + sends auth token
  const handleUpdateProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      showToast("error", "Name and email are required.");
      return;
    }
    setSaveLoading(true);
    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/${safeUser._id}`,
        { name: editName, email: editEmail, phone: editPhone, profileName: editProfileName },
        getAuthConfig()
      );

      const updatedUser = res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);
      setEditName(updatedUser.name || "");
      setEditEmail(updatedUser.email || "");
      setEditPhone(updatedUser.phone || "");
      setEditProfileName(updatedUser.profileName || "");
      showToast("success", "Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      showToast("error", err.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const initials = (safeUser.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div
      style={{ ...S.overlay, ...(mounted ? S.overlayIn : {}) }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ ...S.panel, ...(mounted ? S.panelIn : {}) }}>

        {/* HEADER */}
        <header style={S.header}>
          <div style={S.headerTop}>
            <button style={S.backBtn} onClick={onClose}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              <span>Back</span>
            </button>
            <div style={S.brand}>
              <span style={S.brandIcon}>🍴</span>
              <span style={S.brandName}>EATOZ</span>
            </div>
            <div style={S.livePill}>
              <span style={S.liveDot} />
              Live
            </div>
          </div>

          <div style={S.hero}>
            <div style={S.avatarRing}>
              <div style={S.avatar}>{initials}</div>
            </div>
            <div style={S.heroText}>
              <p style={S.greeting}>WELCOME BACK</p>
              <h1 style={S.heroName}>{safeUser.name}</h1>
              <p style={S.heroEmail}>{safeUser.email}</p>
            </div>
            <div style={S.memberBadge}>
              <span style={S.memberDot} />
              <span>MEMBER</span>
            </div>
          </div>

          <div style={S.statsRow}>
            {[
              { label: "Orders",   value: orders.length },
              { label: "Bookings", value: bookings.length },
              { label: "Plan",     value: "Free" },
            ].map((s, i) => (
              <div key={i} style={{ ...S.stat, ...(i === 2 ? { borderRight: "none" } : {}) }}>
                <div style={S.statValue}>{s.value}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* TABS */}
        <nav style={S.tabs}>
          {[
            { key: "profile",       label: "Profile", icon: "○" },
            { key: "orders",        label: "Orders",  icon: "◇" },
            { key: "subscriptions", label: "Plans",   icon: "◈" },
          ].map(tab => (
            <button
              key={tab.key}
              style={{ ...S.tab, ...(activeTab === tab.key ? S.tabActive : {}) }}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key === "orders") { fetchOrders(); fetchBookings(); }
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.key && <div style={S.tabBar} />}
            </button>
          ))}
        </nav>

        {/* CONTENT */}
        <main style={S.content}>

          {/* ── PROFILE ── */}
          {activeTab === "profile" && (
            <div>
              <div style={S.sectionHead}>
                <div style={S.sectionLine} />
                <span style={S.sectionLabel}>01 — PERSONAL INFORMATION</span>
                <div style={S.sectionLine} />
              </div>

              <div style={S.fieldRow}>
                <div style={{ ...S.field, ...(focusedField === "name" ? S.fieldFocused : {}) }}>
                  <label style={S.label}>FULL NAME</label>
                  <input style={S.input} value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="John Doe" />
                </div>
                <div style={{ ...S.field, ...(focusedField === "display" ? S.fieldFocused : {}) }}>
                  <label style={S.label}>DISPLAY NAME</label>
                  <input style={S.input} value={editProfileName}
                    onChange={e => setEditProfileName(e.target.value)}
                    onFocus={() => setFocusedField("display")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="@johndoe" />
                </div>
              </div>

              <div style={{ ...S.field, ...S.fieldFull, ...(focusedField === "email" ? S.fieldFocused : {}) }}>
                <label style={S.label}>EMAIL ADDRESS</label>
                <input style={S.input} type="email" value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="john@example.com" />
              </div>

              <div style={{ ...S.field, ...S.fieldFull, ...(focusedField === "phone" ? S.fieldFocused : {}) }}>
                <label style={S.label}>PHONE NUMBER</label>
                <input style={S.input} type="tel" value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="+91 98765 43210" />
              </div>

              {toast && (
                <div style={{ ...S.toast, ...(toast.type === "success" ? S.toastSuccess : S.toastError) }}>
                  <span style={S.toastDot} />
                  {toast.msg}
                </div>
              )}

              <button
                style={{ ...S.saveBtn, ...(saveLoading ? S.saveBtnDisabled : {}) }}
                onClick={handleUpdateProfile}
                disabled={saveLoading}
              >
                {saveLoading
                  ? <><span style={S.spinner} /><span>Saving...</span></>
                  : <><span>Save Changes</span><ArrowIcon /></>
                }
              </button>
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeTab === "orders" && (
            <div>
              <div style={S.sectionHead}>
                <div style={S.sectionLine} />
                <span style={S.sectionLabel}>02 — ORDER HISTORY</span>
                <div style={S.sectionLine} />
              </div>

              {toast && (
                <div style={{ ...S.toast, ...(toast.type === "success" ? S.toastSuccess : S.toastError) }}>
                  <span style={S.toastDot} />
                  {toast.msg}
                </div>
              )}

              {ordersLoading ? (
                <div style={S.skeletonWrap}>
                  {[0,1,2].map(i => <div key={i} style={{ ...S.skeleton, animationDelay: `${i*0.15}s` }} />)}
                </div>
              ) : orders.length === 0 ? (
                <div style={S.emptyWrap}>
                  <div style={S.emptyIcon}>◇</div>
                  <p style={S.emptyTitle}>No orders yet</p>
                  <p style={S.emptySub}>Your food & grocery orders will appear here</p>
                </div>
              ) : (
                <div style={S.orderList}>
                  {orders.map((o, i) => {
                    const cancellable = isWithinCancelWindow(o.createdAt) && o.status?.toLowerCase() !== "cancelled";
                    return (
                      <div key={o._id} style={{ ...S.orderCard, ...(cancellable ? S.orderCardNew : {}), animationDelay: `${i*40}ms` }}>
                        <div style={S.orderCardInner}>
                          <div style={S.orderNum}>{String(i+1).padStart(2,"0")}</div>
                          <div style={S.orderInfo}>
                            <div style={S.orderId}>#{o._id.slice(-8).toUpperCase()}</div>
                            <div style={S.orderItems}>{o.items?.map(item => item.name).join(" · ") || "No items"}</div>
                            <div style={S.orderMeta}>
                              <span>{o.paymentMethod}</span>
                              <span>·</span>
                              <span>{new Date(o.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span>
                            </div>
                          </div>
                          <div style={S.orderRight}>
                            <div style={S.orderTotal}>₹{(o.total||0).toLocaleString()}</div>
                            <span style={getBadgeStyle(o.status)}>{o.status || "Placed"}</span>
                          </div>
                        </div>
                        <CancelOrderButton order={o} onCancelled={handleOrderCancelled} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table Bookings */}
              <div style={{ ...S.sectionHead, marginTop: 40 }}>
                <div style={S.sectionLine} />
                <span style={S.sectionLabel}>— TABLE BOOKINGS</span>
                <div style={S.sectionLine} />
              </div>

              {bookingsLoading ? (
                <div style={S.skeletonWrap}>
                  {[0,1].map(i => <div key={i} style={{ ...S.skeleton, animationDelay: `${i*0.15}s` }} />)}
                </div>
              ) : bookings.length === 0 ? (
                <div style={S.emptyWrap}>
                  <div style={S.emptyIcon}>◌</div>
                  <p style={S.emptyTitle}>No table bookings</p>
                  <p style={S.emptySub}>Book a table at a restaurant to see it here</p>
                </div>
              ) : (
                <div style={S.orderList}>
                  {bookings.map((b, i) => (
                    <div key={b._id} style={{ ...S.orderCard, animationDelay: `${i*40}ms` }}>
                      <div style={S.orderCardInner}>
                        <div style={S.orderNum}>{String(i+1).padStart(2,"0")}</div>
                        <div style={S.orderInfo}>
                          <div style={{ ...S.orderId, color: "rgba(255,255,255,0.75)" }}>{b.restaurant}</div>
                          <div style={S.orderItems}>📅 {b.date} &nbsp;·&nbsp; 🕐 {b.time} &nbsp;·&nbsp; 👥 {b.seats} {b.seats === 1 ? "seat" : "seats"}</div>
                          <div style={S.orderMeta}>
                            <span>Booked {new Date(b.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span>
                          </div>
                        </div>
                        <div style={S.orderRight}>
                          <span style={getBadgeStyle(b.status)}>{b.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SUBSCRIPTIONS ── */}
          {activeTab === "subscriptions" && (
            <div>
              <div style={S.sectionHead}>
                <div style={S.sectionLine} />
                <span style={S.sectionLabel}>03 — CHOOSE YOUR PLAN</span>
                <div style={S.sectionLine} />
              </div>
              <div style={S.subGrid}>
                {SUBSCRIPTIONS.map((s, i) => (
                  <div key={s.id} style={{ ...S.subCard, ...(s.highlight ? S.subCardHighlight : {}), animationDelay: `${i*80}ms` }}>
                    {s.highlight && <div style={S.subGlow} />}
                    <div style={S.subTop}>
                      <span style={S.subBadge}>{s.badge}</span>
                      {s.highlight && <span style={S.subBest}>★ BEST</span>}
                    </div>
                    <div style={S.subName}>{s.planName}</div>
                    <div style={S.subTagline}>{s.tagline}</div>
                    <div style={S.subPrice}>
                      <span style={S.subCur}>₹</span>
                      <span style={S.subAmt}>{s.price}</span>
                    </div>
                    <div style={S.subDur}>{s.duration}</div>
                    <div style={S.subDivider} />
                    <ul style={S.subPerks}>
                      {s.perks.map(p => (
                        <li key={p} style={S.subPerkItem}>
                          <span style={S.perkIcon}><CheckIcon /></span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                    <button style={S.subBtn}>
                      <span>Subscribe</span>
                      <ArrowIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer style={S.footer}>
          <div style={S.footerLeft}>
            <span style={S.footerLabel}>SIGNED IN AS</span>
            <span style={S.footerEmail}>{safeUser.email}</span>
          </div>
          <button style={S.logoutBtn} onClick={logout}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </footer>

      </div>
    </div>
  );
}

export default UserDashboard;