import React, { useState, useEffect } from "react";
import axios from "axios";

function LoginModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("login"); // "login" | "otp" | "signup"

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // OTP step
  const [otpValue, setOtpValue] = useState("");
  const [otpEmail, setOtpEmail] = useState(""); // store email for OTP verify
  const [otpTimer, setOtpTimer] = useState(300); // 5 min countdown
  const [timerActive, setTimerActive] = useState(false);

  // Signup fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // "success" | "error"
  const [loading, setLoading] = useState(false);

  // OTP countdown timer
  useEffect(() => {
    let interval;
    if (timerActive && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    } else if (otpTimer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, otpTimer]);

  const formatTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (!isOpen) {
      setMode("login");
      setUsername(""); setPassword("");
      setOtpValue(""); setOtpEmail("");
      setOtpTimer(300); setTimerActive(false);
      setName(""); setEmail(""); setPhone("");
      setSignupPassword(""); setConfirmPassword("");
      setErrors({}); setMessage("");
    }
  }, [isOpen]);

  const showMsg = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
  };

  // Validators
  const validateEmail = v => {
    if (!v) return "Email is required";
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(v) ? "" : "Enter a valid email";
  };
  const validatePassword = v => {
    if (!v) return "Password is required";
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&]).{6,}$/.test(v)
      ? "" : "Must have uppercase, lowercase, number & special char";
  };
  const validateName = v => {
    if (!v.trim()) return "Full name is required";
    if (!/^[A-Za-z\s]+$/.test(v)) return "Name can contain only alphabets";
    return "";
  };
  const validatePhone = v =>
    !v ? "Phone is required" : !/^[0-9]{10}$/.test(v) ? "Enter valid 10-digit number" : "";

  /* ── LOGIN STEP 1: Send OTP ── */
  const handleLoginClick = async () => {
    const newErrors = {
      username: !username.trim() ? "Email is required" : validateEmail(username),
      password: validatePassword(password),
    };
    setErrors(newErrors);
    setMessage("");

    if (newErrors.username || newErrors.password) return;

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/login", {
        email: username,
        password,
      });

      setOtpEmail(username);
      setOtpTimer(300);
      setTimerActive(true);
      setMode("otp");
      showMsg("OTP sent to your email. Check your inbox!");
    } catch (err) {
      showMsg(err.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGIN STEP 2: Verify OTP ── */
  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setErrors({ otp: "Enter the 6-digit OTP" });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: otpEmail,
        otp: otpValue,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      showMsg("✅ Login Successful! Welcome back 🎉");
      setTimeout(() => { onClose(); window.location.reload(); }, 1400);
    } catch (err) {
      showMsg(err.response?.data?.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── RESEND OTP ── */
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/login", {
        email: otpEmail,
        password, // password still in state
      });
      setOtpTimer(300);
      setTimerActive(true);
      setOtpValue("");
      showMsg("OTP resent to your email!");
    } catch (err) {
      showMsg("Failed to resend OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── SIGNUP ── */
  const handleSignupClick = async () => {
    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      phone: validatePhone(phone),
      signupPassword: validatePassword(signupPassword),
      confirmPassword: !confirmPassword
        ? "Confirm Password is required"
        : confirmPassword !== signupPassword
        ? "Passwords do not match" : "",
    };
    setErrors(newErrors);
    setMessage("");

    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password: signupPassword,
        phone,   // ← ADDED: send phone to backend
      });

      const { user, token } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      showMsg("✅ Account created successfully!");
      setTimeout(() => { onClose(); window.location.reload(); }, 1400);
    } catch (err) {
      showMsg(err.response?.data?.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .lm-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          font-family: 'DM Sans', sans-serif;
          animation: lm-fade 0.2s ease;
        }
        @keyframes lm-fade { from{opacity:0} to{opacity:1} }

        .lm-card {
          width: 420px;
          background: #111;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 40px;
          color: white;
          box-shadow: 0 40px 80px rgba(0,0,0,0.8);
          position: relative;
          animation: lm-rise 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes lm-rise { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .lm-close {
          position: absolute; top: 18px; right: 22px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%; width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #888; font-size: 16px;
          transition: all 0.18s ease;
        }
        .lm-close:hover { background: rgba(255,255,255,0.12); color: white; }

        .lm-title { font-size: 26px; font-weight: 700; margin: 0 0 6px; letter-spacing: -0.4px; }
        .lm-sub   { font-size: 13px; color: #666; margin: 0 0 28px; }

        .lm-msg {
          padding: 10px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 500;
          margin-bottom: 18px; display: flex; align-items: center; gap: 8px;
        }
        .lm-msg--success { background: rgba(62,207,142,0.1); border: 1px solid rgba(62,207,142,0.2); color: #3ecf8e; }
        .lm-msg--error   { background: rgba(245,101,101,0.1); border: 1px solid rgba(245,101,101,0.2); color: #f56565; }

        .lm-label { font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: #555; margin-bottom: 7px; display: block; }

        .lm-input {
          width: 100%; padding: 12px 15px;
          background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 11px; color: white;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; box-sizing: border-box;
          transition: border-color 0.18s ease;
          margin-bottom: 4px;
        }
        .lm-input:focus { border-color: rgba(255,255,255,0.28); background: #222; }
        .lm-input::placeholder { color: #444; }

        .lm-field { margin-bottom: 16px; }
        .lm-error { font-size: 11.5px; color: #f56565; margin: 4px 0 0; }

        .lm-phone-wrap {
          display: flex; align-items: center;
          background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 11px; overflow: hidden; margin-bottom: 4px;
        }
        .lm-phone-code {
          padding: 12px 14px; background: #222;
          border-right: 1px solid rgba(255,255,255,0.08);
          font-size: 13px; color: #888; white-space: nowrap;
        }
        .lm-phone-input {
          flex: 1; padding: 12px 15px;
          background: transparent; border: none;
          color: white; font-family: 'DM Sans', sans-serif;
          font-size: 14px; outline: none;
        }

        .lm-btn {
          width: 100%; padding: 13px;
          background: white; color: black;
          border: none; border-radius: 11px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.18s ease;
          margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lm-btn:hover:not(:disabled) { background: #e5e5e5; transform: translateY(-1px); }
        .lm-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .lm-switch { font-size: 13px; color: #555; margin-top: 18px; text-align: center; }
        .lm-switch span { color: #aaa; cursor: pointer; font-weight: 600; transition: color 0.15s; }
        .lm-switch span:hover { color: white; }

        /* OTP INPUT */
        .lm-otp-wrap { display: flex; gap: 10px; justify-content: center; margin-bottom: 4px; }
        .lm-otp-digit {
          width: 48px; height: 56px;
          background: #1a1a1a; border: 1px solid rgba(255,255,255,0.12);
          border-radius: 11px; color: white;
          font-size: 22px; font-weight: 700; text-align: center;
          font-family: 'Courier New', monospace;
          outline: none; transition: border-color 0.18s ease;
        }
        .lm-otp-digit:focus { border-color: rgba(255,255,255,0.4); background: #222; }

        .lm-timer {
          text-align: center; font-size: 12px; color: #555;
          margin: 10px 0 4px;
        }
        .lm-timer span { color: #aaa; font-weight: 600; }

        .lm-resend {
          background: none; border: none; color: #555;
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          cursor: pointer; text-decoration: underline;
          padding: 0; transition: color 0.15s;
        }
        .lm-resend:not(:disabled):hover { color: white; }
        .lm-resend:disabled { cursor: not-allowed; opacity: 0.4; }

        .lm-otp-email {
          font-size: 13px; color: #666; text-align: center;
          margin-bottom: 24px; line-height: 1.5;
        }
        .lm-otp-email strong { color: #aaa; }

        .lm-spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,0.2); border-top-color: #000;
          border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .lm-back-btn {
          background: none; border: none; color: #555;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          cursor: pointer; display: flex; align-items: center; gap: 5px;
          padding: 0; margin-bottom: 20px; transition: color 0.15s;
        }
        .lm-back-btn:hover { color: white; }
      `}</style>

      <div className="lm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="lm-card">
          <button className="lm-close" onClick={onClose}>✕</button>

          {message && (
            <div className={`lm-msg lm-msg--${messageType}`}>
              {messageType === "success" ? "✓" : "✕"} {message}
            </div>
          )}

          {/* ── LOGIN ── */}
          {mode === "login" && (
            <>
              <h2 className="lm-title">Sign In</h2>
              <p className="lm-sub">Enter your credentials to receive an OTP</p>

              <div className="lm-field">
                <label className="lm-label">Email Address</label>
                <input className="lm-input" type="text" placeholder="you@example.com"
                  value={username} onChange={e => setUsername(e.target.value)} />
                {errors.username && <div className="lm-error">{errors.username}</div>}
              </div>

              <div className="lm-field">
                <label className="lm-label">Password</label>
                <input className="lm-input" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLoginClick()} />
                {errors.password && <div className="lm-error">{errors.password}</div>}
              </div>

              <button className="lm-btn" onClick={handleLoginClick} disabled={loading}>
                {loading ? <span className="lm-spinner" /> : "Send OTP →"}
              </button>

              <p className="lm-switch">
                Don't have an account?{" "}
                <span onClick={() => { setMode("signup"); setMessage(""); }}>Create one</span>
              </p>
            </>
          )}

          {/* ── OTP VERIFY ── */}
          {mode === "otp" && (
            <>
              <button className="lm-back-btn" onClick={() => { setMode("login"); setMessage(""); }}>
                ← Back
              </button>
              <h2 className="lm-title">Enter OTP</h2>
              <p className="lm-otp-email">
                We sent a 6-digit code to<br />
                <strong>{otpEmail}</strong>
              </p>

              <div className="lm-field">
                <div className="lm-otp-wrap">
                  {[0,1,2,3,4,5].map(i => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      className="lm-otp-digit"
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otpValue[i] || ""}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (!val) return;
                        const arr = otpValue.split("");
                        arr[i] = val;
                        const next = arr.join("").slice(0, 6);
                        setOtpValue(next);
                        if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === "Backspace") {
                          const arr = otpValue.split("");
                          arr[i] = "";
                          setOtpValue(arr.join(""));
                          if (i > 0) document.getElementById(`otp-${i-1}`)?.focus();
                        }
                      }}
                    />
                  ))}
                </div>
                {errors.otp && <div className="lm-error" style={{textAlign:"center"}}>{errors.otp}</div>}
              </div>

              <div className="lm-timer">
                {otpTimer > 0
                  ? <>OTP expires in <span>{formatTimer(otpTimer)}</span></>
                  : <>OTP expired. &nbsp;<button className="lm-resend" onClick={handleResendOtp}>Resend</button></>
                }
              </div>

              <button className="lm-btn" onClick={handleVerifyOtp} disabled={loading || otpValue.length < 6}
                style={{ marginTop: 18 }}>
                {loading ? <span className="lm-spinner" /> : "Verify & Sign In ✓"}
              </button>
            </>
          )}

          {/* ── SIGNUP ── */}
          {mode === "signup" && (
            <>
              <h2 className="lm-title">Create Account</h2>
              <p className="lm-sub">Join Eatoz and start ordering</p>

              <div className="lm-field">
                <label className="lm-label">Full Name</label>
                <input className="lm-input" type="text" placeholder="John Doe"
                  value={name} onChange={e => setName(e.target.value)} />
                {errors.name && <div className="lm-error">{errors.name}</div>}
              </div>

              <div className="lm-field">
                <label className="lm-label">Email Address</label>
                <input className="lm-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
                {errors.email && <div className="lm-error">{errors.email}</div>}
              </div>

              <div className="lm-field">
                <label className="lm-label">Phone Number</label>
                <div className="lm-phone-wrap">
                  <div className="lm-phone-code">🇮🇳 +91</div>
                  <input className="lm-phone-input" type="tel" placeholder="98765 43210"
                    value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                {errors.phone && <div className="lm-error">{errors.phone}</div>}
              </div>

              <div className="lm-field">
                <label className="lm-label">Password</label>
                <input className="lm-input" type="password" placeholder="Create password"
                  value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
                {errors.signupPassword && <div className="lm-error">{errors.signupPassword}</div>}
              </div>

              <div className="lm-field">
                <label className="lm-label">Confirm Password</label>
                <input className="lm-input" type="password" placeholder="Repeat password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                {errors.confirmPassword && <div className="lm-error">{errors.confirmPassword}</div>}
              </div>

              <button className="lm-btn" onClick={handleSignupClick} disabled={loading}>
                {loading ? <span className="lm-spinner" /> : "Create Account →"}
              </button>

              <p className="lm-switch">
                Already have an account?{" "}
                <span onClick={() => { setMode("login"); setMessage(""); }}>Sign in</span>
              </p>
            </>
          )}

        </div>
      </div>
    </>
  );
}

export default LoginModal;