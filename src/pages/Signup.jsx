import React, { useState } from "react";
import "../LoginModal.css";

function Signup() {

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");

  const handleSignup = async () => {

    if(!name || !email || !password){
      setError("All fields required");
      return;
    }

    try{

      const res = await fetch("http://localhost:5000/api/auth/signup",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({name,email,password})
      });

      const data = await res.json();

      if(res.ok){

        setSuccess("✅ Account created successfully. Please login.");
        setError("");

        setName("");
        setEmail("");
        setPassword("");

      }else{
        setError(data.message || "Signup failed");
        setSuccess("");
      }

    }catch(err){
      setError("Server error");
    }

  }

  return (
    <div className="lm-overlay">
      <div className="lm-modal">

        <h2 className="lm-title">Create Account</h2>

        <input
          className="lm-input"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

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
        {success && <div style={{color:"green"}}>{success}</div>}

        <button className="lm-btn" onClick={handleSignup}>
          Create Account
        </button>

        <p className="lm-switch">
          Already have an account?  
          <a href="/login">Login</a>
        </p>

      </div>
    </div>
  );
}

export default Signup;