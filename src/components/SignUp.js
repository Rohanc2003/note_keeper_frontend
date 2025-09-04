import React, { useState } from "react";
import axios from "axios";
import NotesDashboard from "../components/NotesDashboard.js";
import "../SignUp.css";
import { Link } from "react-router-dom";

const BACKEND_URL = "https://note-keeper-backend-gaz2.onrender.com";
export default function SignUp() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/request-otp`, {
        name,   // send both, since backend expects
        email,
      });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  // Verify OTP + Create User
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/verify-otp`, {
        name,
        email,
        otp,
      });
      setToken(res.data.token);
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setMessage("");
    setError("");
    try {
      await axios.post(`${BACKEND_URL}/auth/request-otp`, {
        name,
        email,
      });
      setMessage("OTP resent successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    }
  };

  if (step === 3) {
    return <NotesDashboard token={token} name={name} email={email} />;
  }

  return (
    <div className="signup-wrapper">
      {/* Form container */}
      <div className="signup-container">
        <div><div className="loading-spinner">⏳ </div><h2>HD</h2></div>
        
        <h2 className="signup-title">Sign up</h2>
        <p className="signup-subtitle">Sign up to enjoy the feature of HD</p>

        {/* Step 1 → Request OTP */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="signup-form">
            <input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">Get OTP</button>
          </form>
        )}

        {/* Step 2 → Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="signup-form">
            <input value={name} disabled />
            <input type="email" value={email} disabled />
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">Sign up</button>
            <p className="resend-link" onClick={handleResendOTP}>
              Resend OTP
            </p>
          </form>
        )}

        {/* Google Signup */}
        <button
          type="button"
          className="btn-google"
          onClick={() => (window.location.href =`${BACKEND_URL}/auth/google`)}
        >
          Sign up with Google
        </button>

        {message && <p className="msg-success">{message}</p>}
        {error && <p className="msg-error">{error}</p>}

        <p className="signup-footer">
  Already have an account? <Link to="/login">Sign in</Link>
</p>
      </div>

      {/* Desktop image (hidden on mobile, shown on PC) */}
      <div className="signup-image">
        <img src="/pc.jpg" alt="Signup visual" />
      </div>
    </div>
  );
}
