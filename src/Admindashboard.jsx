import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { adminApi } from "./Adminapi";
import "./AdminDashboard.css";
import axios from "axios";

import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6","#ec4899","#8b5cf6","#14b8a6"];
const COLOR_LABELS = {
  "Razorpay":   "#6366f1",
  "Wallet":     "#10b981",
  "Pay Later":  "#f59e0b",
  "Placed":     "#3b82f6",
  "Preparing":  "#f59e0b",
  "On the Way": "#8b5cf6",
  "Delivered":  "#10b981",
  "Cancelled":  "#ef4444",
};

function getColor(label, index) {
  return COLOR_LABELS[label] || COLORS[index % COLORS.length];
}

function AnimatedNumber({ value, prefix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
    let start = 0;
    const steps = 60;
    const increment = num / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      start = Math.min(start + increment, num);
      setDisplay(Math.round(start));
      if (step >= steps) clearInterval(timer);
    }, 1200 / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}</span>;
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="ad-bar-row">
      <span className="ad-bar-label">{label}</span>
      <div className="ad-bar-track">
        <div className="ad-bar-fill" style={{ width: `${pct}%`, background: color || "#6366f1" }} />
      </div>
      <span className="ad-bar-count" style={{ color }}>{value}</span>
    </div>
  );
}

function DonutChart({ data }) {
  if (!data?.length) return <div className="ad-empty-sub">No data yet</div>;
  const total = data.reduce((s, d) => s + (d.count || 0), 0);
  const r = 52, cx = 64, cy = 64, circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="ad-donut-wrap">
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={128} height={128} viewBox="0 0 128 128">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e1e2e" strokeWidth={18} />
          {data.map((d, i) => {
            const color = getColor(d._id || d.name, i);
            const dash = (d.count / total) * circ;
            const gap = circ - dash;
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r}
                fill="none" stroke={color} strokeWidth={18}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)" }}
              />
            );
            offset += dash;
            return el;
          })}
          <text x={cx} y={cy - 7} textAnchor="middle"
            style={{ fill: "#fff", fontSize: 20, fontWeight: 700, fontFamily: "Inter,sans-serif" }}>{total}</text>
          <text x={cx} y={cy + 10} textAnchor="middle"
            style={{ fill: "rgba(255,255,255,0.3)", fontSize: 8, fontFamily: "Inter,sans-serif", letterSpacing: 1.5 }}>TOTAL</text>
        </svg>
      </div>
      <div className="ad-donut-legend">
        {data.map((d, i) => {
          const color = getColor(d._id || d.name, i);
          return (
            <div key={i} className="ad-legend-item">
              <div className="ad-legend-dot" style={{ background: color }} />
              <span className="ad-legend-name">{d._id || d.name || "—"}</span>
              <span className="ad-legend-pct" style={{ color }}>{((d.count / total) * 100).toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InsightChart({ data, bookings = [] }) {
  const [tab, setTab]         = useState("orders");
  const [range, setRange]     = useState("7D");
  const [flipped, setFlipped] = useState(false);

  const orderRef    = useRef(null);
  const bookingRef  = useRef(null);
  const orderInst   = useRef(null);
  const bookingInst = useRef(null);

  const BAR_COLORS = ["#14b8a6","#6366f1","#f59e0b","#10b981","#ec4899","#8b5cf6","#3b82f6","#ef4444"];

  const sliceData = useCallback((r) => {
    if (!data?.length) return [];
    const sorted = [...data].sort((a, b) => (a._id > b._id ? 1 : -1));
    if (r === "7D")  return sorted.slice(-7);
    if (r === "14D") return sorted.slice(-14);
    return sorted.slice(-30);
  }, [data]);

  const restaurantData = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (!b.restaurant) return;
      if (!map[b.restaurant]) map[b.restaurant] = { name: b.restaurant, count: 0, seats: 0 };
      map[b.restaurant].count += 1;
      map[b.restaurant].seats += b.seats || 0;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [bookings]);

  const switchTab = (t) => {
    if (t === tab) return;
    setFlipped(t === "bookings");
    setTab(t);
  };

  const buildOrderChart = useCallback(() => {
    if (!orderRef.current) return;
    if (orderInst.current) { orderInst.current.destroy(); orderInst.current = null; }

    const isWeekend = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getDay() === 0 || d.getDay() === 6;
    };

    const days = sliceData(range).map((d) => {
      const count   = d.count || 0;
      const revenue = d.revenue || count * (d.avgOrderValue || 0);
      const avgVal  = count > 0 ? revenue / count : 0;
      const weekend = isWeekend(d._id);
      return { label: d._id?.slice(5) || d._id, orders: count, avgVal, revenue, weekend };
    });

    requestAnimationFrame(() => {
      if (!orderRef.current) return;
      orderInst.current = new Chart(orderRef.current, {
        type: "line",
        data: {
          labels: days.map((d) => d.label),
          datasets: [
            {
              label: "Profit avg",
              data: days.map((d) => d.avgVal >= 200 ? d.avgVal : null),
              borderColor: "#10b981",
              backgroundColor: (ctx) => {
                const { ctx: c, chartArea } = ctx.chart;
                if (!chartArea) return "rgba(16,185,129,0.15)";
                const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                g.addColorStop(0, "rgba(16,185,129,0.4)");
                g.addColorStop(1, "rgba(16,185,129,0.0)");
                return g;
              },
              pointBackgroundColor: "#10b981", pointBorderColor: "#fff", pointBorderWidth: 2,
              pointRadius: 5, pointHoverRadius: 8,
              fill: true, tension: 0.45, borderWidth: 3, spanGaps: false,
            },
            {
              label: "Loss avg",
              data: days.map((d) => d.avgVal > 0 && d.avgVal < 200 ? d.avgVal : null),
              borderColor: "#ef4444",
              backgroundColor: (ctx) => {
                const { ctx: c, chartArea } = ctx.chart;
                if (!chartArea) return "rgba(239,68,68,0.1)";
                const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                g.addColorStop(0, "rgba(239,68,68,0.35)");
                g.addColorStop(1, "rgba(239,68,68,0.0)");
                return g;
              },
              pointBackgroundColor: "#ef4444", pointBorderColor: "#fff", pointBorderWidth: 2,
              pointRadius: 5, pointHoverRadius: 8,
              fill: true, tension: 0.45, borderWidth: 3, spanGaps: false,
            },
            {
              label: "Weekend sales",
              data: days.map((d) => d.weekend ? d.orders : null),
              borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.12)",
              pointBackgroundColor: "#f59e0b", pointBorderColor: "#fff", pointBorderWidth: 2,
              pointRadius: 7, pointHoverRadius: 10, pointStyle: "star",
              fill: true, tension: 0.45, borderWidth: 2.5, spanGaps: false, yAxisID: "y2",
            },
            {
              label: "Orders",
              data: days.map((d) => d.orders),
              borderColor: "rgba(99,102,241,0.6)", backgroundColor: "transparent",
              pointBackgroundColor: "#6366f1", pointBorderColor: "#fff", pointBorderWidth: 1.5,
              pointRadius: 4, pointHoverRadius: 7,
              fill: false, tension: 0.45, borderWidth: 2, borderDash: [5, 4], yAxisID: "y2",
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: {
            duration: 900, easing: "easeOutQuart",
            delay: (ctx) => ctx.type === "data" && ctx.mode === "default" ? ctx.dataIndex * 60 : 0,
          },
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(6,6,18,0.97)", borderColor: "rgba(255,255,255,0.15)", borderWidth: 1,
              titleColor: "rgba(255,255,255,0.5)", bodyColor: "#fff", padding: 12, cornerRadius: 10,
              callbacks: {
                label: (c) => {
                  if (c.datasetIndex === 0 && c.raw != null) return ` Profit avg: ₹${Math.round(c.raw)}`;
                  if (c.datasetIndex === 1 && c.raw != null) return ` Loss avg: ₹${Math.round(c.raw)}`;
                  if (c.datasetIndex === 2 && c.raw != null) return ` Weekend sales: ${c.raw} orders`;
                  if (c.datasetIndex === 3) return ` Orders: ${c.raw}`;
                  return null;
                },
              },
            },
          },
          scales: {
            x: { ticks: { color: "rgba(255,255,255,0.28)", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.04)" } },
            y: {
              ticks: { color: "rgba(255,255,255,0.28)", font: { size: 10 }, callback: (v) => "₹" + v },
              grid: { color: "rgba(255,255,255,0.05)" },
              title: { display: true, text: "Avg order value (₹)", color: "rgba(255,255,255,0.2)", font: { size: 10 } },
            },
            y2: {
              position: "right", grid: { display: false },
              ticks: { color: "rgba(99,102,241,0.5)", font: { size: 10 } },
              title: { display: true, text: "Order count", color: "rgba(99,102,241,0.4)", font: { size: 10 } },
            },
          },
        },
      });
    });
  }, [range, sliceData]);

  const buildBookingChart = useCallback(() => {
    if (!bookingRef.current || !restaurantData.length) return;
    if (bookingInst.current) { bookingInst.current.destroy(); bookingInst.current = null; }

    requestAnimationFrame(() => {
      if (!bookingRef.current) return;
      bookingInst.current = new Chart(bookingRef.current, {
        type: "bar",
        data: {
          labels: restaurantData.map((r) => r.name),
          datasets: [{
            label: "Bookings",
            data: restaurantData.map((r) => r.count),
            backgroundColor: restaurantData.map((_, i) => BAR_COLORS[i % BAR_COLORS.length] + "bb"),
            borderColor:     restaurantData.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
            borderWidth: 2, borderRadius: 8, borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: {
            duration: 900, easing: "easeOutBounce",
            delay: (ctx) => ctx.type === "data" && ctx.mode === "default" ? ctx.dataIndex * 100 : 0,
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(6,6,18,0.97)", borderColor: "rgba(255,255,255,0.15)", borderWidth: 1,
              titleColor: "rgba(255,255,255,0.5)", bodyColor: "#fff", padding: 12, cornerRadius: 10,
            },
          },
          scales: {
            x: { ticks: { color: "rgba(255,255,255,0.45)", font: { size: 9 }, maxRotation: 35, minRotation: 35 }, grid: { display: false } },
            y: {
              ticks: { color: "rgba(255,255,255,0.28)", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.05)" },
              title: { display: true, text: "Bookings", color: "rgba(255,255,255,0.2)", font: { size: 10 } },
            },
          },
        },
      });
    });
  }, [restaurantData]);

  useEffect(() => {
    if (tab === "orders") { const t = setTimeout(buildOrderChart, 0); return () => clearTimeout(t); }
  }, [tab, range, buildOrderChart]);

  useEffect(() => {
    if (tab === "bookings") { const t = setTimeout(buildBookingChart, 400); return () => clearTimeout(t); }
  }, [tab, buildBookingChart]);

  useEffect(() => () => { orderInst.current?.destroy(); bookingInst.current?.destroy(); }, []);

  const orderDays = sliceData(range).map((d) => {
    const count = d.count || 0;
    const revenue = d.revenue || count * (d.avgOrderValue || 0);
    return { avgVal: count > 0 ? revenue / count : 0, revenue };
  });
  const profitDays    = orderDays.filter((d) => d.avgVal >= 200).length;
  const lossDays      = orderDays.filter((d) => d.avgVal > 0 && d.avgVal < 200).length;
  const totalRev      = orderDays.reduce((s, d) => s + d.revenue, 0);
  const maxBooking    = Math.max(...restaurantData.map((r) => r.count), 1);
  const totalBookings = restaurantData.reduce((s, r) => s + r.count, 0);
  const totalSeats    = restaurantData.reduce((s, r) => s + r.seats, 0);

  const PillBtn = ({ label, active, onClick, grad }) => (
    <button onClick={onClick} style={{
      padding: "6px 16px", borderRadius: 7, border: "none", fontSize: 12, fontWeight: 700,
      cursor: "pointer", fontFamily: "inherit",
      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
      background: active ? grad : "transparent",
      color: active ? "#fff" : "rgba(255,255,255,0.35)",
      boxShadow: active ? "0 4px 14px rgba(0,0,0,0.35)" : "none",
      transform: active ? "translateY(-1px)" : "translateY(0)",
    }}>{label}</button>
  );

  if (!data?.length) return <div className="ad-empty-sub">No data yet</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 4 }}>
            {tab === "orders" ? "Orders — Profit & Loss Insight" : "Bookings — Restaurant Performance"}
          </span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {tab === "orders" ? (
              <>
                <span style={badgeStyle("#10b981")}>▲ Profit days: {profitDays}</span>
                <span style={badgeStyle("#ef4444")}>▼ Loss days: {lossDays}</span>
                <span style={badgeStyle("#818cf8")}>₹{Math.round(totalRev / 1000)}k revenue</span>
              </>
            ) : (
              <>
                <span style={badgeStyle("#14b8a6")}>{totalBookings} bookings</span>
                <span style={badgeStyle("#818cf8")}>{totalSeats} seats</span>
                {restaurantData[0] && <span style={badgeStyle("#f59e0b")}>Top: {restaurantData[0].name.split(" ")[0]}</span>}
              </>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {tab === "orders" && (
            <div style={pillGroupStyle}>
              {["7D", "14D", "30D"].map((r) => (
                <button key={r} onClick={() => setRange(r)} style={{
                  padding: "5px 11px", borderRadius: 6, border: "none",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
                  background: range === r ? "linear-gradient(135deg, rgba(99,102,241,0.55), rgba(139,92,246,0.55))" : "transparent",
                  color: range === r ? "#c4b5fd" : "rgba(255,255,255,0.3)",
                  boxShadow: range === r ? "0 2px 10px rgba(99,102,241,0.35), inset 0 0 0 1px rgba(99,102,241,0.5)" : "none",
                  transform: range === r ? "scale(1.06)" : "scale(1)",
                }}>{r}</button>
              ))}
            </div>
          )}
          <div style={pillGroupStyle}>
            <PillBtn label="Orders"   active={tab === "orders"}   onClick={() => switchTab("orders")}   grad="linear-gradient(135deg,#6366f1,#8b5cf6)" />
            <PillBtn label="Bookings" active={tab === "bookings"} onClick={() => switchTab("bookings")} grad="linear-gradient(135deg,#14b8a6,#0f766e)" />
          </div>
        </div>
      </div>

      <div style={{ perspective: "1200px", perspectiveOrigin: "50% 50%", width: "100%", height: 500 }}>
        <div style={{
          width: "100%", height: "100%", position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(0deg)", overflowY: "auto" }}>
            <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { color: "#10b981", label: "Profit avg (≥₹200)", dashed: false },
                { color: "#ef4444", label: "Loss avg (<₹200)",   dashed: false },
                { color: "#f59e0b", label: "Weekend sales",       dashed: false },
                { color: "rgba(99,102,241,0.6)", label: "Order count", dashed: true },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {l.dashed
                    ? <div style={{ width: 22, height: 0, borderTop: `2px dashed ${l.color}` }} />
                    : <div style={{ width: 22, height: 3, borderRadius: 2, background: l.color }} />
                  }
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{l.label}</span>
                </div>
              ))}
            </div>
            <div style={{ position: "relative", height: 430 }}><canvas ref={orderRef} /></div>
          </div>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", overflowY: "auto", padding: "4px 0" }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 0.8, color: "rgba(255,255,255,0.28)", marginBottom: 12 }}>Bookings by restaurant</div>
            {restaurantData.length === 0 && <div className="ad-empty-sub">No bookings yet</div>}
            {restaurantData.map((r, i) => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", width: 120, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4, background: BAR_COLORS[i % BAR_COLORS.length],
                    width: tab === "bookings" ? `${(r.count / maxBooking * 100).toFixed(1)}%` : "0%",
                    transition: "width 1s cubic-bezier(0.16,1,0.3,1)", transitionDelay: `${i * 70 + 400}ms`,
                  }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: BAR_COLORS[i % BAR_COLORS.length], width: 28, textAlign: "right" }}>{r.count}</span>
              </div>
            ))}
            {restaurantData.length > 0 && (
              <div style={{ position: "relative", height: 240, marginTop: 20 }}><canvas ref={bookingRef} /></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const pillGroupStyle = {
  display: "flex", gap: 3,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10, padding: 3,
};

const badgeStyle = (color) => ({
  display: "inline-flex", alignItems: "center", padding: "3px 10px",
  borderRadius: 20, fontSize: 11, fontWeight: 700,
  background: color + "18", border: `1px solid ${color}40`, color,
});

/* ══════════════════════════════════════════════════════════════
   REPORTS — Invoice, CSV, Email
══════════════════════════════════════════════════════════════ */
const BASE_URL = "http://localhost:5000/api";
const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("adminToken")}` });

function rptFormatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}
function rptFormatTime(d) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function rptStatusColor(s) {
  return { Placed:"#3b82f6", Preparing:"#f59e0b", "On the Way":"#8b5cf6", Delivered:"#10b981", Cancelled:"#ef4444" }[s] || "#6366f1";
}
function rptPayColor(p) {
  return { Razorpay:"#6366f1", Wallet:"#10b981", "Pay Later":"#f59e0b", UPI:"#14b8a6", Card:"#ec4899" }[p] || "#6366f1";
}

function exportAllCSV(orders) {
  const rows = [
    ["Order ID","Date","Customer","Email","Phone","Items","Total (₹)","Payment","Status"],
    ...orders.map(o => [
      o._id.slice(-8).toUpperCase(),
      rptFormatDate(o.createdAt),
      o.userId?.name || "—",
      o.userId?.email || "—",
      o.userId?.phone || "—",
      o.items?.map(i => `${i.name} x${i.quantity}`).join(" | "),
      o.total,
      o.paymentMethod,
      o.status,
    ]),
  ];
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `eatoz-orders-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function exportSingleCSV(o) {
  const rows = [
    ["Order ID", o._id.slice(-8).toUpperCase()],
    ["Date",     rptFormatDate(o.createdAt)],
    ["Time",     rptFormatTime(o.createdAt)],
    ["Customer", o.userId?.name || "—"],
    ["Email",    o.userId?.email || "—"],
    ["Phone",    o.userId?.phone || "—"],
    ["Payment",  o.paymentMethod],
    ["Status",   o.status],
    [],
    ["Item","Qty","Unit Price (₹)","Subtotal (₹)"],
    ...(o.items || []).map(i => [i.name, i.quantity, i.price, i.price * i.quantity]),
    [],
    ["","","Total", o.total],
  ];
  const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `invoice-${o._id.slice(-8)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════════════
   PREMIUM INVOICE MODAL
══════════════════════════════════════════════════════════════ */
function InvoiceModal({ order, onClose, onSendEmail }) {
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [visible, setVisible] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 320);
  };

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice #${order._id.slice(-8).toUpperCase()}</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'DM Sans',sans-serif;background:#faf9f7;color:#1a1a1a;padding:48px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .inv-outer{max-width:700px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 40px rgba(0,0,0,0.08)}
      .inv-masthead{background:linear-gradient(135deg,#0d0d1a 0%,#1a0a2e 50%,#0d0d1a 100%);padding:40px 48px;position:relative;overflow:hidden}
      .inv-brand-row{display:flex;justify-content:space-between;align-items:flex-start}
      .inv-brand-name{font-family:'Playfair Display',serif;font-size:36px;font-weight:700;color:#fff;letter-spacing:-1px;line-height:1}
      .inv-brand-tagline{font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-top:6px}
      .inv-number-block{text-align:right}
      .inv-number-label{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:4px}
      .inv-number-value{font-size:22px;font-weight:600;color:#fff;font-family:'Playfair Display',serif;letter-spacing:-0.5px}
      .inv-date-badge{display:inline-flex;align-items:center;gap:6px;margin-top:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:4px 12px}
      .inv-date-text{font-size:11px;color:rgba(255,255,255,0.55)}
      .inv-status-chip{display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:5px 14px;border-radius:20px;font-size:11px;font-weight:600;border:1px solid}
      .inv-body{padding:40px 48px}
      .inv-parties{display:grid;grid-template-columns:1fr 1fr;gap:32px;padding-bottom:32px;border-bottom:1px solid #f0ede8;margin-bottom:32px}
      .inv-party-section-label{font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#aaa;margin-bottom:12px;font-weight:600}
      .inv-party-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:600;color:#1a1a1a;margin-bottom:6px}
      .inv-party-detail{font-size:12px;color:#777;line-height:1.7}
      .inv-payment-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;border:1px solid;margin-top:8px;font-size:12px;font-weight:600}
      .inv-items-label{font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#aaa;font-weight:600;margin-bottom:16px}
      table{width:100%;border-collapse:collapse}
      .inv-table-head{background:#faf9f7}
      .inv-table-head th{padding:10px 14px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#aaa;font-weight:600;border-bottom:2px solid #f0ede8}
      .inv-table-head th:last-child{text-align:right}
      td{padding:14px;font-size:13px;border-bottom:1px solid #f8f6f3;vertical-align:middle;color:#333}
      td:last-child{text-align:right;font-weight:600}
      .inv-spacer{height:24px}
      .inv-total-row td{background:#faf9f7;font-size:15px;font-weight:700;border-bottom:none;padding-top:16px;padding-bottom:16px}
      .inv-grand-total{font-family:'Playfair Display',serif;font-size:24px;color:#6366f1}
      .inv-footer{margin-top:40px;padding-top:24px;border-top:1px solid #f0ede8;display:flex;justify-content:space-between;align-items:center}
      .inv-footer-brand{font-family:'Playfair Display',serif;font-size:16px;color:#1a1a1a;letter-spacing:-0.5px}
      .inv-footer-note{font-size:11px;color:#ccc;text-align:right;line-height:1.6}
    </style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const handleSendEmail = async () => {
    setSending(true);
    try { await onSendEmail(order); setSent(true); }
    finally { setSending(false); }
  };

  const statusColor = rptStatusColor(order.status);
  const payColor    = rptPayColor(order.paymentMethod);
  const subtotal    = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const tax         = Math.round(subtotal * 0.05);
  const delivery    = order.total - subtotal - tax > 0 ? order.total - subtotal - tax : 0;

  return (
    <div className={`inv-overlay ${visible ? "inv-overlay--visible" : ""}`}
      onClick={e => e.target === e.currentTarget && handleClose()}>

      <div className={`inv-shell ${visible ? "inv-shell--visible" : ""}`}>

        {/* ── Top action bar ── */}
        <div className="inv-action-bar">
          <div className="inv-action-bar-left">
            <div className="inv-tag">INVOICE</div>
            <span className="inv-tag-id">#{order._id.slice(-8).toUpperCase()}</span>
            <div className="inv-status-dot" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
            <span className="inv-status-text" style={{ color: statusColor }}>{order.status}</span>
          </div>
          <div className="inv-action-bar-right">
            <button className="inv-action-btn" onClick={() => exportSingleCSV(order)} title="Download CSV">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              CSV
            </button>
            <button className="inv-action-btn" onClick={handlePrint} title="Print Invoice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/>
              </svg>
              Print
            </button>
            <button
              className={`inv-action-btn inv-action-btn--email ${sent ? "inv-action-btn--sent" : ""}`}
              onClick={handleSendEmail}
              disabled={sending || sent}
              title="Email Invoice"
            >
              {sent ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              )}
              {sending ? "Sending…" : sent ? "Sent!" : "Email"}
            </button>
            <button className="inv-close-btn" onClick={handleClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Invoice document ── */}
        <div className="inv-scroll-area">
          <div className="inv-document" ref={printRef}>
            <div className="inv-outer">
              <div className="inv-masthead">
                <div className="inv-masthead-glow inv-masthead-glow--1" />
                <div className="inv-masthead-glow inv-masthead-glow--2" />
                <div className="inv-masthead-noise" />

                <div className="inv-brand-row">
                  <div>
                    <div className="inv-brand-name">Eatoz</div>
                    <div className="inv-brand-tagline">Food &amp; Grocery Delivery</div>
                  </div>
                  <div className="inv-number-block">
                    <div className="inv-number-label">Invoice</div>
                    <div className="inv-number-value">#{order._id.slice(-8).toUpperCase()}</div>
                    <div className="inv-date-badge">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span className="inv-date-text">{rptFormatDate(order.createdAt)} · {rptFormatTime(order.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="inv-masthead-divider" />

                <div className="inv-masthead-meta">
                  <div className="inv-status-chip" style={{ background: statusColor + "20", borderColor: statusColor + "50", color: statusColor }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
                    {order.status}
                  </div>
                  <div className="inv-masthead-ref">
                    {order.razorpayPaymentId && (
                      <span className="inv-ref-tag">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        {order.razorpayPaymentId.slice(0, 20)}…
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="inv-body">
                {/* Parties */}
                <div className="inv-parties">
                  <div>
                    <div className="inv-section-label">Billed To</div>
                    <div className="inv-party-name">{order.userId?.name || "Customer"}</div>
                    <div className="inv-party-details">
                      {order.userId?.email && (
                        <div className="inv-party-row">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                          </svg>
                          {order.userId.email}
                        </div>
                      )}
                      {order.userId?.phone && (
                        <div className="inv-party-row">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.1a16 16 0 006 6l.62-.62a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                          </svg>
                          {order.userId.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="inv-section-label">Payment</div>
                    <div className="inv-pay-method" style={{ color: payColor }}>
                      <div className="inv-pay-dot" style={{ background: payColor }} />
                      {order.paymentMethod}
                    </div>
                    <div className="inv-pay-badge" style={{ background: payColor + "15", borderColor: payColor + "40", color: payColor }}>
                      Verified &amp; Captured
                    </div>
                    {order.razorpayPaymentId && (
                      <div className="inv-ref-mono">Ref: {order.razorpayPaymentId}</div>
                    )}
                  </div>
                </div>

                {/* Items table */}
                <div className="inv-section-label" style={{ marginBottom: 14 }}>Order Items</div>
                <div className="inv-table-wrap">
                  <table className="inv-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Cuisine</th>
                        <th className="inv-th-center">Qty</th>
                        <th className="inv-th-right">Unit Price</th>
                        <th className="inv-th-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item, i) => (
                        <tr key={i} className="inv-item-row">
                          <td>
                            <div className="inv-item-name">{item.name}</div>
                          </td>
                          <td><span className="inv-item-tag">{item.cuisine || "—"}</span></td>
                          <td className="inv-td-center">
                            <span className="inv-qty-badge">{item.quantity}</span>
                          </td>
                          <td className="inv-td-right inv-price">₹{item.price.toLocaleString()}</td>
                          <td className="inv-td-right inv-subtotal">₹{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="inv-totals">
                  <div className="inv-totals-inner">
                    <div className="inv-total-line">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    {tax > 0 && (
                      <div className="inv-total-line">
                        <span>GST (5%)</span>
                        <span>₹{tax.toLocaleString()}</span>
                      </div>
                    )}
                    {delivery > 0 && (
                      <div className="inv-total-line">
                        <span>Delivery</span>
                        <span>₹{delivery.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="inv-total-divider" />
                    <div className="inv-total-grand">
                      <span>Total</span>
                      <span className="inv-grand-amount">₹{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="inv-footer">
                  <div className="inv-footer-brand">
                    <span className="inv-footer-logo">Eatoz</span>
                    <span className="inv-footer-tagline">Thank you for your order 🍴</span>
                  </div>
                  <div className="inv-footer-note">
                    Computer-generated invoice · No signature required<br />
                    <span style={{ opacity: 0.5 }}>Generated {new Date().toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminReports({ showToast }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [statusF, setStatusF] = useState("All");
  const [payF,    setPayF]    = useState("All");
  const [invoice, setInvoice] = useState(null);
  const [page,    setPage]    = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/admin/orders`, { headers: getAuthHeaders() });
        setOrders(res.data);
      } catch {
        showToast?.("Failed to load orders", false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchQ = !q ||
      o._id.toLowerCase().includes(q) ||
      o.userId?.name?.toLowerCase().includes(q) ||
      o.userId?.email?.toLowerCase().includes(q) ||
      o.items?.some(i => i.name.toLowerCase().includes(q));
    const matchS = statusF === "All" || o.status === statusF;
    const matchP = payF    === "All" || o.paymentMethod === payF;
    return matchQ && matchS && matchP;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalRev  = filtered.reduce((s, o) => s + o.total, 0);
  const avgOrder  = filtered.length ? Math.round(totalRev / filtered.length) : 0;
  const delivered = filtered.filter(o => o.status === "Delivered").length;

  // ✅ FIXED: correct URL pointing to /api/orders/:id/send-invoice
  const handleSendEmail = async (order) => {
    try {
      await axios.post(
        `${BASE_URL}/orders/${order._id}/send-invoice`,
        {},
        { headers: getAuthHeaders() }
      );
      showToast?.("Invoice sent to " + (order.userId?.email || "user"));
    } catch (err) {
      showToast?.(
        err?.response?.data?.message || "Failed to send email",
        false
      );
    }
  };

  const STATUS_LIST = ["All","Placed","Preparing","On the Way","Delivered","Cancelled"];
  const PAY_LIST    = ["All","Razorpay","Wallet","Pay Later","UPI","Card"];

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:36, fontWeight:800, color:"#a78bfa", letterSpacing:-0.5, lineHeight:1 }}>Reports</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginTop:6 }}>
            {filtered.length} orders · invoices, CSV exports &amp; email delivery
          </p>
        </div>
        <button onClick={() => exportAllCSV(filtered)} style={{
          padding:"10px 20px",
          background:"linear-gradient(135deg,#10b981,#059669)",
          color:"white", border:"none", borderRadius:10,
          fontFamily:"inherit", fontSize:12, fontWeight:700,
          cursor:"pointer", boxShadow:"0 4px 12px rgba(16,185,129,0.3)",
        }}>
          ⬇ Export All CSV ({filtered.length})
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Total Orders",    val: filtered.length,                  color:"#6366f1", icon:"📦" },
          { label:"Total Revenue",   val: `₹${totalRev.toLocaleString()}`,  color:"#10b981", icon:"💰" },
          { label:"Avg Order Value", val: `₹${avgOrder}`,                   color:"#f59e0b", icon:"📊" },
          { label:"Delivered",       val: delivered,                        color:"#14b8a6", icon:"✅" },
        ].map((s,i) => (
          <div key={i} style={{
            padding:"18px 20px", borderRadius:12,
            border:"1px solid rgba(255,255,255,0.06)",
            borderTop:`3px solid ${s.color}`,
            background:`${s.color}0d`,
          }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:26, fontWeight:800, color:s.color, letterSpacing:-0.5 }}>{s.val}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:0.5, marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, maxWidth:320 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:18, color:"rgba(255,255,255,0.25)", pointerEvents:"none" }}>⌕</span>
          <input
            style={{
              width:"100%", padding:"9px 14px 9px 36px",
              background:"rgba(255,255,255,0.05)",
              border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:10, color:"#f0f0ff",
              fontFamily:"inherit", fontSize:13, outline:"none",
            }}
            placeholder="Search orders, customers, items…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div style={{ display:"flex", gap:3, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:3, flexWrap:"wrap" }}>
          {STATUS_LIST.map(s => (
            <button key={s} onClick={() => { setStatusF(s); setPage(1); }} style={{
              padding:"5px 10px", borderRadius:7, border:"none",
              background: statusF===s ? "rgba(99,102,241,0.25)" : "transparent",
              color: statusF===s ? "#818cf8" : "rgba(255,255,255,0.35)",
              fontFamily:"inherit", fontSize:11, fontWeight:700, cursor:"pointer",
            }}>{s}</button>
          ))}
        </div>

        <div style={{ display:"flex", gap:3, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:3, flexWrap:"wrap" }}>
          {PAY_LIST.map(p => (
            <button key={p} onClick={() => { setPayF(p); setPage(1); }} style={{
              padding:"5px 10px", borderRadius:7, border:"none",
              background: payF===p ? "rgba(16,185,129,0.2)" : "transparent",
              color: payF===p ? "#10b981" : "rgba(255,255,255,0.35)",
              fontFamily:"inherit", fontSize:11, fontWeight:700, cursor:"pointer",
            }}>{p}</button>
          ))}
        </div>
      </div>

      <div style={{ background:"rgba(13,13,26,0.8)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:"60px 40px", textAlign:"center", fontSize:16, color:"rgba(255,255,255,0.2)" }}>Loading orders…</div>
        ) : paginated.length === 0 ? (
          <div style={{ padding:"60px 40px", textAlign:"center", fontSize:16, color:"rgba(255,255,255,0.2)" }}>No orders match your filters</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                  {["Order ID","Date","Customer","Items","Total","Payment","Status","Actions"].map(h => (
                    <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:10, letterSpacing:0.8, textTransform:"uppercase", color:"rgba(255,255,255,0.35)", fontWeight:600, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(o => (
                  <tr key={o._id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding:"13px 16px" }}>
                      <span style={{ color:"#818cf8", fontFamily:"monospace", fontSize:12, fontWeight:700 }}>#{o._id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{rptFormatDate(o.createdAt)}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{rptFormatTime(o.createdAt)}</div>
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.85)" }}>{o.userId?.name || "—"}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", fontFamily:"monospace" }}>{o.userId?.email}</div>
                    </td>
                    <td style={{ padding:"13px 16px", fontSize:12, color:"rgba(255,255,255,0.6)" }}>
                      {o.items?.slice(0,2).map(i => `${i.name} ×${i.quantity}`).join(", ")}
                      {o.items?.length > 2 && <span style={{ color:"#818cf8" }}> +{o.items.length-2} more</span>}
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <span style={{ color:"#10b981", fontWeight:700, fontSize:14 }}>₹{o.total}</span>
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <span style={{
                        padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:700,
                        background: rptPayColor(o.paymentMethod) + "20",
                        border:`1px solid ${rptPayColor(o.paymentMethod)}40`,
                        color: rptPayColor(o.paymentMethod),
                      }}>{o.paymentMethod}</span>
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <span style={{
                        padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:700,
                        background: rptStatusColor(o.status) + "20",
                        border:`1px solid ${rptStatusColor(o.status)}40`,
                        color: rptStatusColor(o.status),
                      }}>{o.status}</span>
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => setInvoice(o)} style={{
                          padding:"5px 10px", borderRadius:7,
                          background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)",
                          color:"#818cf8", fontFamily:"inherit", fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap",
                        }}>📄 Invoice</button>
                        <button onClick={() => exportSingleCSV(o)} style={{
                          padding:"5px 10px", borderRadius:7,
                          background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.25)",
                          color:"#10b981", fontFamily:"inherit", fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap",
                        }}>⬇ CSV</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} style={{ padding:"7px 16px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontFamily:"inherit", fontSize:12, fontWeight:600, cursor:"pointer" }}>‹ Prev</button>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>Page {page} of {totalPages} · {filtered.length} orders</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} style={{ padding:"7px 16px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.6)", fontFamily:"inherit", fontSize:12, fontWeight:600, cursor:"pointer" }}>Next ›</button>
          </div>
        )}
      </div>

      {invoice && (
        <InvoiceModal order={invoice} onClose={() => setInvoice(null)} onSendEmail={handleSendEmail} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FIELD DEFS
══════════════════════════════════════════════════════════════ */
const FIELD_DEFS = {
  food:       ["name","cuisine","brand","rating","price","image"],
  grocery:    ["name","price","image"],
  restaurant: ["name","cuisine","location","priceForTwo","rating","image"],
};

function ItemModal({ type, item, onSave, onClose }) {
  const [form, setForm] = useState(item || {});
  return (
    <div className="ad-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ad-modal">
        <div className="ad-modal-header">
          <h3 className="ad-modal-title">{item ? "Edit" : "New"} {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
          <button className="ad-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ad-modal-body">
          {FIELD_DEFS[type].map(f => (
            <div key={f} className="ad-modal-field">
              <label className="ad-modal-label">{f}</label>
              <input className="ad-modal-input"
                value={form[f] || ""}
                onChange={e => setForm({ ...form, [f]: e.target.value })}
                placeholder={f === "price" || f === "priceForTwo" ? "0" : f}
                type={f === "price" || f === "priceForTwo" ? "number" : "text"}
              />
            </div>
          ))}
          <div className="ad-modal-footer">
            <button className="ad-btn-primary" onClick={() => onSave(form)}>{item ? "Update" : "Add"}</button>
            <button className="ad-btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="ad-search-wrap">
      <span className="ad-search-icon">⌕</span>
      <input className="ad-search-input" type="text" value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder || "Search..."} />
      {value && <button className="ad-search-clear" onClick={() => onChange("")}>✕</button>}
    </div>
  );
}

function ItemManager({ title, icon, items, fields, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const filtered = items.filter(item =>
    !search || Object.values(item).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div>
      <div className="ad-page-header">
        <div>
          <h1 className="ad-page-title">{title}</h1>
          <p className="ad-page-subtitle">
            {filtered.length === items.length ? `${items.length} items in catalogue` : `${filtered.length} of ${items.length} items`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <SearchBar value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}...`} />
          <button className="ad-btn-primary" onClick={onAdd}>+ Add Item</button>
        </div>
      </div>
      <div className="ad-items-grid">
        {filtered.map(item => (
          <div key={item._id} className="ad-item-card">
            {item.image
              ? <img src={item.image} alt={item.name} className="ad-item-img" onError={e => { e.target.style.display = "none"; }} />
              : <div className="ad-item-img-placeholder">{icon}</div>
            }
            <div className="ad-item-body">
              <div className="ad-item-name">{item.name}</div>
              <div className="ad-item-meta">
                {fields.filter(f => f !== "name" && f !== "image" && item[f]).map(f => (
                  <div key={f} className="ad-item-meta-row">
                    <span className="ad-item-meta-key">{f}</span>
                    <span className="ad-item-meta-val">{f === "price" || f === "priceForTwo" ? `₹${item[f]}` : item[f]}</span>
                  </div>
                ))}
              </div>
              <div className="ad-item-actions">
                <button className="ad-item-action-btn edit" onClick={() => onEdit(item)}>Edit</button>
                <button className="ad-item-action-btn delete" onClick={() => onDelete(item._id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1" }}>
            <div className="ad-empty">
              <div className="ad-empty-label">{search ? `No results for "${search}"` : "Nothing here yet"}</div>
              <div className="ad-empty-sub">{search ? "Try a different search term" : `Add your first ${title.toLowerCase()} item`}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const TABS = [
  { id: "overview",    label: "Overview",     icon: "⬡", color: "#6366f1" },
  { id: "users",       label: "Users",        icon: "◉", color: "#10b981" },
  { id: "orders",      label: "Transactions", icon: "◈", color: "#f59e0b" },
  { id: "bookings",    label: "Bookings",     icon: "◇", color: "#14b8a6" },
  { id: "reports",     label: "Reports",      icon: "◑", color: "#a78bfa" },
  { id: "food",        label: "Food",         icon: "◍", color: "#ef4444" },
  { id: "grocery",     label: "Grocery",      icon: "◎", color: "#3b82f6" },
  { id: "restaurants", label: "Restaurants",  icon: "◌", color: "#ec4899" },
];

const STATUS_LIST = ["Placed","Preparing","On the Way","Delivered","Cancelled"];

function AdminDashboard({ admin, onLogout, onBackHome }) {
  const [activeTab, setActiveTab]     = useState("overview");
  const [stats, setStats]             = useState(null);
  const [survey, setSurvey]           = useState(null);
  const [users, setUsers]             = useState([]);
  const [orders, setOrders]           = useState([]);
  const [bookings, setBookings]       = useState([]);
  const [foods, setFoods]             = useState([]);
  const [groceries, setGroceries]     = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [storeOpen, setStoreOpen]     = useState(true);
  const [modal, setModal]             = useState(null);
  const [toast, setToast]             = useState(null);
  const [collapsed, setCollapsed]     = useState(false);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async (tab) => {
    try {
      if (tab === "overview") {
        const [s, sv, bk] = await Promise.all([adminApi.getStats(), adminApi.getSurvey(), adminApi.getBookings()]);
        setStats(s.data); setSurvey(sv.data); setBookings(bk.data);
      } else if (tab === "users")       { setUsers((await adminApi.getUsers()).data); }
      else if (tab === "orders")        { setOrders((await adminApi.getOrders()).data); }
      else if (tab === "bookings")      { setBookings((await adminApi.getBookings()).data); }
      else if (tab === "food")          { setFoods((await adminApi.getFood()).data); }
      else if (tab === "grocery")       { setGroceries((await adminApi.getGrocery()).data); }
      else if (tab === "restaurants")   { setRestaurants((await adminApi.getRestaurants()).data); }
    } catch { showToast("Failed to load", false); }
  }, []);

  useEffect(() => {
    load(activeTab);
    adminApi.getStoreStatus().then(r => setStoreOpen(r.data.isOpen));
  }, [activeTab, load]);

  const toggleStore = async () => {
    const next = !storeOpen;
    await adminApi.setStoreStatus(next);
    setStoreOpen(next);
    showToast(next ? "Store is now open" : "Store is now closed");
  };

  const handleSave = async (type, form) => {
    try {
      if (modal.item) {
        if (type === "food")       await adminApi.updateFood(modal.item._id, form);
        if (type === "grocery")    await adminApi.updateGrocery(modal.item._id, form);
        if (type === "restaurant") await adminApi.updateRestaurant(modal.item._id, form);
      } else {
        if (type === "food")       await adminApi.addFood(form);
        if (type === "grocery")    await adminApi.addGrocery(form);
        if (type === "restaurant") await adminApi.addRestaurant(form);
      }
      setModal(null);
      load(type === "restaurant" ? "restaurants" : type);
      showToast(`${modal.item ? "Updated" : "Added"} successfully`);
    } catch { showToast("Operation failed", false); }
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Permanently delete this item?")) return;
    try {
      if (type === "food")       await adminApi.deleteFood(id);
      if (type === "grocery")    await adminApi.deleteGrocery(id);
      if (type === "restaurant") await adminApi.deleteRestaurant(id);
      if (type === "user")       await adminApi.deleteUser(id);
      load(type === "restaurant" ? "restaurants" : type);
      showToast("Deleted");
    } catch { showToast("Delete failed", false); }
  };

  const handleBan = async (id) => {
    try {
      const r = await adminApi.toggleBan(id);
      showToast(r.data.message);
      load("users");
    } catch { showToast("Failed", false); }
  };

  const updateOrderStatus = async (id, status) => {
    await adminApi.updateOrderStatus(id, status);
    showToast("Status updated");
    load("orders");
  };

  const cancelBooking = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await adminApi.cancelBooking(id);
      showToast("Booking cancelled");
      load("bookings");
    } catch { showToast("Failed to cancel", false); }
  };

  const activeTabData = TABS.find(t => t.id === activeTab);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className={`ad-root ${collapsed ? "ad-collapsed" : ""}`}>
      {toast && (
        <div className={`ad-toast ${toast.ok ? "" : "error"}`}>
          {toast.ok ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      <aside className="ad-sidebar">
        <div className="ad-sidebar-top">
          <div className="ad-brand">
            <div className="ad-brand-icon">🍴</div>
            {!collapsed && (
              <div className="ad-brand-text">
                <div className="ad-brand-label">Eatoz</div>
                <div className="ad-brand-sub">Admin Console</div>
              </div>
            )}
          </div>
          <button className="ad-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        <nav className="ad-nav">
          {TABS.map(t => (
            <button key={t.id}
              className={`ad-nav-item ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
              title={t.label}
              style={activeTab === t.id ? {
                background: `${t.color}18`, borderColor: `${t.color}55`, color: t.color,
                boxShadow: `inset 0 0 20px ${t.color}10`,
              } : {}}
            >
              <span className="ad-nav-icon">{t.icon}</span>
              {!collapsed && <span className="ad-nav-label">{t.label}</span>}
              {activeTab === t.id && !collapsed && <div className="ad-nav-pip" style={{ background: t.color }} />}
            </button>
          ))}
        </nav>

        <div className="ad-store-wrap">
          {!collapsed && <div className="ad-store-heading">Store</div>}
          <button className={`ad-store-btn ${storeOpen ? "open" : "closed"}`} onClick={toggleStore} title="Toggle store">
            <div className={`ad-store-dot ${storeOpen ? "open" : ""}`} />
            {!collapsed && <span>{storeOpen ? "Online" : "Offline"}</span>}
          </button>
        </div>

        <div className="ad-sidebar-footer">
          {!collapsed && (
            <>
              <div className="ad-avatar">{admin?.name?.[0]?.toUpperCase() || "A"}</div>
              <div className="ad-admin-name">{admin?.name}</div>
              <div className="ad-admin-email">{admin?.email}</div>
            </>
          )}
          <button className="ad-home-btn" onClick={onBackHome} title="Back to Home">
            {collapsed ? "⌂" : "← Back to Home"}
          </button>
          <button className="ad-logout-btn" onClick={onLogout} title="Sign Out">
            {collapsed ? "⏻" : "Sign Out"}
          </button>
        </div>
      </aside>

      <main className="ad-main">
        <div className="ad-topbar">
          <div className="ad-topbar-left">
            <span className="ad-breadcrumb">Dashboard</span>
            <span className="ad-breadcrumb-sep">/</span>
            <span className="ad-breadcrumb-active" style={{ color: activeTabData?.color }}>{activeTabData?.label}</span>
          </div>
          <div className="ad-topbar-right">
            <span className="ad-topbar-date">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <div className="ad-live-badge">
              <span className="ad-live-dot" />
              Live
            </div>
          </div>
        </div>

        <div className="ad-content">
          {activeTab === "overview" && stats && (
            <div>
              <div className="ad-greeting">
                <h1 className="ad-greeting-title">{greeting}, {admin?.name?.split(" ")[0]} 👋</h1>
                <p className="ad-greeting-sub">Here's your Eatoz platform at a glance.</p>
              </div>
              <div className="ad-stat-grid">
                {[
                  { label: "Total Users",     value: stats.totalUsers,       sub: `${stats.activeUsers} active`,    icon: "👤", color: "#6366f1", prefix: "" },
                  { label: "Total Orders",    value: stats.totalOrders,      sub: "all time",                       icon: "📦", color: "#f59e0b", prefix: "" },
                  { label: "Revenue",         value: stats.totalRevenue || 0,sub: "Razorpay verified",              icon: "💰", color: "#10b981", prefix: "₹" },
                  { label: "Catalogue Items", value: (stats.totalFood||0)+(stats.totalGrocery||0), sub: `${stats.totalRestaurants} restaurants`, icon: "🗂", color: "#ec4899", prefix: "" },
                ].map((s, i) => (
                  <div key={i} className="ad-stat-card" style={{ borderColor: `${s.color}40`, background: `linear-gradient(135deg, ${s.color}10 0%, transparent 60%)` }}>
                    <div className="ad-stat-header">
                      <div className="ad-stat-icon-box" style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                      </div>
                      <span className="ad-stat-arrow" style={{ color: s.color }}>↑ 12%</span>
                    </div>
                    <div className="ad-stat-value" style={{ color: s.color }}><AnimatedNumber value={s.value} prefix={s.prefix} /></div>
                    <div className="ad-stat-label">{s.label}</div>
                    <div className="ad-stat-sub">{s.sub}</div>
                    <div className="ad-stat-bar-bg"><div className="ad-stat-bar-fill" style={{ background: s.color, width: "65%" }} /></div>
                  </div>
                ))}
              </div>

              <div className="ad-charts-row">
                <div className="ad-panel ad-panel-tall">
                  <div className="ad-panel-header">
                    <span className="ad-panel-title">Orders &amp; Bookings Insights</span>
                    <span className="ad-pill" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>Live</span>
                  </div>
                  <div className="ad-panel-body" style={{ padding: "20px 24px" }}>
                    <InsightChart data={stats.dailyOrders} bookings={bookings} />
                  </div>
                </div>
                <div className="ad-charts-stack">
                  <div className="ad-panel">
                    <div className="ad-panel-header">
                      <span className="ad-panel-title">Payment Methods</span>
                      <span className="ad-pill" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>Live</span>
                    </div>
                    <div className="ad-panel-body">
                      <DonutChart data={stats.paymentBreakdown?.map(p => ({ _id: p._id, count: p.count }))} />
                    </div>
                  </div>
                  <div className="ad-panel">
                    <div className="ad-panel-header">
                      <span className="ad-panel-title">Order Status</span>
                      <span className="ad-pill" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>Live</span>
                    </div>
                    <div className="ad-panel-body">
                      <DonutChart data={stats.statusBreakdown?.map(s => ({ _id: s._id, count: s.count }))} />
                    </div>
                  </div>
                </div>
              </div>

              {survey && (
                <>
                  <div className="ad-section-heading">
                    <span>📊 Survey &amp; Trends</span>
                    <div className="ad-section-line" />
                  </div>
                  <div className="ad-grid-2">
                    <div className="ad-panel">
                      <div className="ad-panel-header"><span className="ad-panel-title">Cuisine Preference</span></div>
                      <div className="ad-panel-body">
                        {!survey.topCuisines?.length ? <div className="ad-empty-sub">No data yet</div>
                          : survey.topCuisines.map((c, i) => <MiniBar key={i} label={c._id} value={c.count} max={survey.topCuisines[0]?.count} color={COLORS[i % COLORS.length]} />)}
                      </div>
                    </div>
                    <div className="ad-panel">
                      <div className="ad-panel-header"><span className="ad-panel-title">Most Ordered Food</span></div>
                      <div className="ad-panel-body">
                        {!survey.topFoods?.length ? <div className="ad-empty-sub">No data yet</div>
                          : survey.topFoods.slice(0,7).map((f, i) => <MiniBar key={i} label={f._id} value={f.count} max={survey.topFoods[0]?.count} color={COLORS[i % COLORS.length]} />)}
                      </div>
                    </div>
                    <div className="ad-panel">
                      <div className="ad-panel-header"><span className="ad-panel-title">Most Ordered Grocery</span></div>
                      <div className="ad-panel-body">
                        {!survey.topGroceries?.length ? <div className="ad-empty-sub">No data yet</div>
                          : survey.topGroceries.slice(0,7).map((g, i) => <MiniBar key={i} label={g._id} value={g.count} max={survey.topGroceries[0]?.count} color={COLORS[i % COLORS.length]} />)}
                      </div>
                    </div>
                    <div className="ad-panel">
                      <div className="ad-panel-header"><span className="ad-panel-title">Payment Preference</span></div>
                      <div className="ad-panel-body">
                        <DonutChart data={survey.paymentPreference} />
                        <div className="ad-avg-box">
                          <div className="ad-avg-label">Avg. Order Value</div>
                          <div className="ad-avg-value">₹{(survey.avgOrderValue || 0).toFixed(0)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className="ad-page-header">
                <div>
                  <h1 className="ad-page-title" style={{ color: "#10b981" }}>Users</h1>
                  <p className="ad-page-subtitle">{users.length} accounts registered</p>
                </div>
              </div>
              <div className="ad-summary-row">
                {[
                  { num: users.length,                                label: "Total",   color: "#6366f1" },
                  { num: users.filter(u => u.isActive).length,       label: "Active",  color: "#10b981" },
                  { num: users.filter(u => !u.isActive).length,      label: "Banned",  color: "#ef4444" },
                  { num: users.filter(u => u.orderCount > 0).length, label: "Ordered", color: "#f59e0b" },
                ].map((s, i) => (
                  <div key={i} className="ad-summary-card" style={{ borderTop: `3px solid ${s.color}`, background: `${s.color}0d` }}>
                    <div className="ad-summary-num" style={{ color: s.color }}>{s.num}</div>
                    <div className="ad-summary-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="ad-panel">
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead><tr>{["Name","Email","Phone","Orders","Spent","Joined","Status","Actions"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td><div className="ad-table-name">{u.name}</div></td>
                          <td><span className="ad-table-mono">{u.email}</span></td>
                          <td><span className="ad-table-mono">{u.phone || "—"}</span></td>
                          <td style={{ color: "#6366f1", fontWeight: 600 }}>{u.orderCount}</td>
                          <td style={{ color: "#10b981", fontWeight: 600 }}>₹{(u.totalSpent || 0).toLocaleString()}</td>
                          <td><span className="ad-table-mono">{new Date(u.createdAt).toLocaleDateString()}</span></td>
                          <td><span className={`ad-badge ${u.isActive ? "active" : "banned"}`}>{u.isActive ? "Active" : "Banned"}</span></td>
                          <td>
                            <div className="ad-btn-row">
                              <button className="ad-btn-icon" onClick={() => handleBan(u._id)}>{u.isActive ? "Ban" : "Unban"}</button>
                              <button className="ad-btn-danger" onClick={() => handleDelete("user", u._id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <div className="ad-empty"><div className="ad-empty-label">No users yet</div></div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <div className="ad-page-header">
                <div>
                  <h1 className="ad-page-title" style={{ color: "#f59e0b" }}>Transactions</h1>
                  <p className="ad-page-subtitle">{orders.length} orders total</p>
                </div>
              </div>
              {orders.length > 0 && (
                <div className="ad-summary-row">
                  {STATUS_LIST.map((s, i) => (
                    <div key={s} className="ad-summary-card" style={{ borderTop: `3px solid ${getColor(s, i)}`, background: `${getColor(s, i)}0d` }}>
                      <div className="ad-summary-num" style={{ color: getColor(s, i) }}>{orders.filter(o => o.status === s).length}</div>
                      <div className="ad-summary-label">{s}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="ad-panel">
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead><tr>{["ID","Customer","Items","Total","Payment","Status","Date","Update"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o._id}>
                          <td><span className="ad-table-mono" style={{ color: "#6366f1" }}>#{o._id.slice(-6).toUpperCase()}</span></td>
                          <td>
                            <div className="ad-table-name">{o.userId?.name || "—"}</div>
                            <div className="ad-table-sub">{o.userId?.email}</div>
                          </td>
                          <td>{o.items?.length} item(s)</td>
                          <td style={{ color: "#10b981", fontWeight: 600 }}>₹{o.total}</td>
                          <td><span className={`ad-badge ${o.paymentMethod?.toLowerCase().replace(/\s/g,"") || "razorpay"}`}>{o.paymentMethod}</span></td>
                          <td><span className={`ad-badge ${o.status?.toLowerCase().replace(/\s/g,"") || "placed"}`}>{o.status}</span></td>
                          <td><span className="ad-table-mono">{new Date(o.createdAt).toLocaleDateString()}</span></td>
                          <td>
                            <select className="ad-select" value={o.status} onChange={e => updateOrderStatus(o._id, e.target.value)}>
                              {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && <div className="ad-empty"><div className="ad-empty-label">No transactions yet</div></div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div>
              <div className="ad-page-header">
                <div>
                  <h1 className="ad-page-title" style={{ color: "#14b8a6" }}>Table Bookings</h1>
                  <p className="ad-page-subtitle">{bookings.length} bookings total</p>
                </div>
              </div>
              <div className="ad-summary-row">
                {[
                  { label: "Total",     num: bookings.length, color: "#14b8a6" },
                  { label: "Confirmed", num: bookings.filter(b => b.status === "Confirmed").length, color: "#10b981" },
                  { label: "Cancelled", num: bookings.filter(b => b.status === "Cancelled").length, color: "#ef4444" },
                ].map((s, i) => (
                  <div key={i} className="ad-summary-card" style={{ borderTop: `3px solid ${s.color}`, background: `${s.color}0d` }}>
                    <div className="ad-summary-num" style={{ color: s.color }}>{s.num}</div>
                    <div className="ad-summary-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="ad-panel">
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead><tr>{["#","User","Email","Restaurant","Date","Time","Seats","Status","Booked On","Action"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {bookings.map((b, i) => (
                        <tr key={b._id}>
                          <td><span className="ad-table-mono" style={{ color: "#14b8a6" }}>{i + 1}</span></td>
                          <td><div className="ad-table-name">{b.userId?.name || "—"}</div></td>
                          <td><span className="ad-table-mono">{b.userId?.email || "—"}</span></td>
                          <td style={{ color: "#14b8a6", fontWeight: 600 }}>{b.restaurant}</td>
                          <td><span className="ad-table-mono">{b.date}</span></td>
                          <td><span className="ad-table-mono">{b.time}</span></td>
                          <td style={{ color: "#6366f1", fontWeight: 600 }}>{b.seats}</td>
                          <td><span className={`ad-badge ${b.status === "Confirmed" ? "active" : "cancelled"}`}>{b.status}</span></td>
                          <td><span className="ad-table-mono">{new Date(b.createdAt).toLocaleDateString()}</span></td>
                          <td>{b.status === "Confirmed" && <button className="ad-btn-danger" onClick={() => cancelBooking(b._id)}>Cancel</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bookings.length === 0 && (
                    <div className="ad-empty">
                      <div className="ad-empty-label">No bookings yet</div>
                      <div className="ad-empty-sub">Table bookings will appear here</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reports" && <AdminReports showToast={showToast} />}

          {activeTab === "food" && (
            <ItemManager title="Food" icon="🍔" items={foods} fields={FIELD_DEFS.food}
              onAdd={() => setModal({ type: "food", item: null })}
              onEdit={item => setModal({ type: "food", item })}
              onDelete={id => handleDelete("food", id)} />
          )}

          {activeTab === "grocery" && (
            <ItemManager title="Grocery" icon="🛒" items={groceries} fields={FIELD_DEFS.grocery}
              onAdd={() => setModal({ type: "grocery", item: null })}
              onEdit={item => setModal({ type: "grocery", item })}
              onDelete={id => handleDelete("grocery", id)} />
          )}

          {activeTab === "restaurants" && (
            <ItemManager title="Restaurants" icon="🍽" items={restaurants} fields={FIELD_DEFS.restaurant}
              onAdd={() => setModal({ type: "restaurant", item: null })}
              onEdit={item => setModal({ type: "restaurant", item })}
              onDelete={id => handleDelete("restaurant", id)} />
          )}
        </div>
      </main>

      {modal && (
        <ItemModal type={modal.type} item={modal.item}
          onSave={form => handleSave(modal.type, form)}
          onClose={() => setModal(null)} />
      )}
    </div>
  );
}

export default AdminDashboard;