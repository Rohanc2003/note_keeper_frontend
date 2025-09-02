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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Auto-redirect if token already exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  // Step 1: Request OTP (LOGIN flow)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) return setError("Email is required");
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/auth/login-check", { email });
      if (res.data?.message === "OTP sent successfully") {
        setOtpRequested(true);
        setMessage("OTP sent to your email!");
      } else if (res.data?.error) {
        setError(res.data.error);
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error requesting OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!otp.trim()) return setError("Enter the OTP sent to your email");
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/auth/verify-otp", { email, otp });
      // backend returns: { message, token, user: { id, name, email } }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.user.name || "");
      localStorage.setItem("email", res.data.user.email || email);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Just reuse login-check to regenerate & resend OTP for login
    await handleRequestOtp(new Event("submit"));
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="loading-spinner" aria-hidden>⏳</div>
        <h2>HD</h2>
      </div>

      <h3 className="login-title">Sign In</h3>
      <p className="login-subtitle">Please login to continue to your account.</p>

      {error && <p className="error-msg">{error}</p>}
      {message && <p className="success-msg">{message}</p>}

      {!otpRequested ? (
        <form onSubmit={handleRequestOtp} className="login-form">
          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Request OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="login-form">
          <input type="email" value={email} disabled />
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
          <button type="button" className="linklike resend-link" onClick={handleResend}>
            Resend OTP
          </button>
        </form>
      )}

      <div className="login-options">
        <label>
          <input type="checkbox" /> Keep me logged in
        </label>
      </div>

      <p className="login-footer">
        Need an account?? <a href="/signup">Create one</a>
      </p>
    </div>
  );
}

export default Login;
