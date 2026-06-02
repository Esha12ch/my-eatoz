import React, { useState } from "react";
import "../LoginModal.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {

    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    try {

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "/";

      } else {
        setError(data.message || "Login failed");
      }

    } catch (err) {
      setError("Server error");
    }

  };

  return (
    <div className="lm-overlay">
      <div className="lm-modal">

        <h2 className="lm-title">Login</h2>

        <input
          className="lm-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          className="lm-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        {error && <div className="lm-error">{error}</div>}

        <button className="lm-btn" onClick={handleLogin}>
          Sign In
        </button>

        <p className="lm-switch">
          Don't have an account?  
          <a href="/signup">Signup</a>
        </p>

      </div>
    </div>
  );
}

export default Login;