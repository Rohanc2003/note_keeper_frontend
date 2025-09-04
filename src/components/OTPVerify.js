import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "https://note-keeper-backend-gaz2.onrender.com";
export default function OTPVerify({ email, setStep, setToken, setMessage, setError }) {
  const [otp, setOtp] = useState("");

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/verify-otp`, { email, otp });
      setToken(res.data.token);
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleVerifyOTP}>
      <div>
        <label>Enter OTP: </label>
        <input value={otp} onChange={e => setOtp(e.target.value)} required />
      </div>
      <button type="submit">Verify OTP</button>
    </form>
  );
}
