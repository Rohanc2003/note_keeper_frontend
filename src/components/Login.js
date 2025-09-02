import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const navigate = useNavigate();

  // ✅ Auto-redirect if token already exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Step 1: Request OTP (Login)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/auth/login-check", { email });
      if (res.status === 200) {
        setOtpRequested(true);
        setMessage("OTP sent to your email!");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error requesting OTP. Try again.");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await axios.post("http://localhost:5000/auth/verify-otp", { email, otp });
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("name", response.data.user.name);
        localStorage.setItem("email", response.data.user.email);
        navigate("/dashboard"); // ✅ redirect to NotesDashboard
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="loading-spinner">⏳</div>
        <h2>HD</h2>
      </div>

      <h3 className="login-title">Sign In</h3>
      <p className="login-subtitle">Please login to continue to your account.</p>

      {error && <p className="error-msg">{error}</p>}
      {message && <p className="success-msg">{message}</p>}

      {/* Step 1: Request OTP */}
      {!otpRequested && (
        <form onSubmit={handleRequestOtp} className="login-form">
          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Request OTP</button>
        </form>
      )}

      {/* Step 2: Enter OTP */}
      {otpRequested && (
        <form onSubmit={handleVerifyOtp} className="login-form">
          <input type="email" value={email} disabled />
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Verify & Login</button>
          <p className="resend-link" onClick={handleRequestOtp}>Resend OTP</p>
        </form>
      )}

      <div className="login-options">
        <label>
          <input type="checkbox" /> Keep me logged in
        </label>
      </div>

      <p className="login-footer">
        Need an account? <a href="/signup">Create one</a>
      </p>
    </div>
  );
}

export default Login;
