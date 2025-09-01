import React, { useState } from "react";
import axios from "axios";

function App() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = request, 2 = verify
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/auth/request-otp", {
        user_id: parseInt(userId),
        email,
      });
      setMessage(res.data.message);
      setStep(2); // move to OTP verification step
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/auth/verify-otp", {
        user_id: parseInt(userId),
        otp,
      });
      setMessage(res.data.message);
      setStep(1); // reset to request OTP if needed
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>OTP Authentication</h2>

      {step === 1 && (
        <form onSubmit={handleRequestOTP}>
          <div>
            <label>User ID: </label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: "1rem" }}>
            <label>Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={{ marginTop: "1rem" }}>
            Send OTP
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOTP}>
          <div>
            <label>Enter OTP: </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={{ marginTop: "1rem" }}>
            Verify OTP
          </button>
        </form>
      )}

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
