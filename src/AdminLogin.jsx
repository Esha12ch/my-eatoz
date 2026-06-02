import { useState } from "react";
import axios from "axios";
import "./AdminLogin.css";

function AdminLogin({ onLogin, onBack }) {  // ✅ onBack in props
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(null);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminUser", JSON.stringify(res.data.admin));
      onLogin(res.data.admin, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-page">
      <div className="al-orb al-orb-1" />
      <div className="al-orb al-orb-2" />
      <div className="al-orb al-orb-3" />
      <div className="al-grid" />

      <div className="al-card">

        {/* ✅ Back Button */}
        <button className="al-back-btn" onClick={onBack}>
          <span className="al-back-arrow">←</span>
          <span>Back to Home</span>
        </button>

        {/* Brand */}
        <div className="al-brand-wrap">
          <div className="al-brand-glow" />
          <div className="al-brand">
            <span className="al-brand-icon">🍴</span>
            <span className="al-brand-name">Eatoz</span>
          </div>
          <div className="al-brand-tag">Admin Console</div>
          <p className="al-subtitle">Restricted access — authorised personnel only</p>
        </div>

        {error && (
          <div className="al-error">
            <span className="al-error-icon">!</span>
            <span>{error}</span>
          </div>
        )}

        <div className={`al-field ${focused === "email" ? "focused" : ""}`}>
          <label className="al-label">Email Address</label>
          <div className="al-input-wrap">
            <span className="al-input-icon">✉</span>
            <input
              className="al-input"
              type="email"
              placeholder="admin@eatoz.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
            />
          </div>
        </div>

        <div className={`al-field ${focused === "password" ? "focused" : ""}`}>
          <label className="al-label">Password</label>
          <div className="al-input-wrap">
            <span className="al-input-icon">⚿</span>
            <input
              className="al-input"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        <button className="al-btn" onClick={handleLogin} disabled={loading}>
          {loading ? (
            <>
              <span className="al-spinner" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Access Dashboard</span>
              <span className="al-btn-arrow">→</span>
            </>
          )}
        </button>

        <div className="al-footer-note">
          <span className="al-dot" />
          All sessions are monitored and logged
          <span className="al-dot" />
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;