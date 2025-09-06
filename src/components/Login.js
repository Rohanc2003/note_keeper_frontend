import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../login.css";

const BACKEND_URL = "https://note-keeper-backend-gaz2.onrender.com";

function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const navigate = useNavigate();

  // 🔑 Handle Google redirect or auto-login if already logged in
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const name = urlParams.get("name");
    const email = urlParams.get("email");

    if (token) {
      // Save token + user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ name, email }));

      // Redirect to dashboard
      navigate("/dashboard");
    } else {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        navigate("/dashboard");
      }
    }
  }, [navigate]);

  // 📩 Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login-check`, { email });
      if (res.status === 200) {
        setOtpRequested(true);
        setMessage("OTP sent to your email!");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error requesting OTP. Try again.");
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/verify-otp`, {
        email,
        otp,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: response.data.user.name,
            email: response.data.user.email,
          })
        );
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
    }
  };

  // 🌐 Google Login
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          <div className="loading-spinner">⏳</div>
          <h2>HD</h2>
        </div>

        <h3 className="login-title">Sign In</h3>
        <p className="login-subtitle">
          Please login to continue to your account.
        </p>

        {error && <p className="error-msg">{error}</p>}
        {message && <p className="success-msg">{message}</p>}

        {!otpRequested && (
          <form onSubmit={handleRequestOtp} className="login-form">
            <input
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">
              Request OTP
            </button>
          </form>
        )}

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
            <button type="submit" className="btn-primary">
              Verify & Login
            </button>
            <p className="resend-link" onClick={handleRequestOtp}>
              Resend OTP
            </p>
          </form>
        )}

        <div className="google-login">
          <button className="btn-google" onClick={handleGoogleLogin}>
            Sign in with Google
          </button>
        </div>

        <p className="login-footer">
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </div>

      {/* ✅ Image section */}
      <div className="login-image">
        <img src="/pc.jpg" alt="Login visual" />
      </div>
    </div>
  );
}

export default Login;
