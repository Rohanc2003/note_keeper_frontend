import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "https://note-keeper-backend-gaz2.onrender.com";
export default function OTPRequest({ setStep, setEmail, setName, setMessage, setError }) {
  const [localName, setLocalName] = useState("");
  const [localEmail, setLocalEmail] = useState("");

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/request-otp`, {
        name: localName,
        email: localEmail,
      });
      setName(localName);
      setEmail(localEmail);
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleRequestOTP}>
      <div>
        <label>Name: </label>
        <input value={localName} onChange={e => setLocalName(e.target.value)} required />
      </div>
      <div>
        <label>Email: </label>
        <input type="email" value={localEmail} onChange={e => setLocalEmail(e.target.value)} required />
      </div>
      <button type="submit">Send OTP</button>
    </form>
  );
}
