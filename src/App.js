import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";   // 👈 import Login
import NotesDashboard from "./components/NotesDashboard";

function App() {
  return (
    <Router>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Note App - OTP Authentication</h2>
        <Routes>
          {/* Default route → Signup */}
          <Route path="/" element={<Navigate to="/signup" />} />

          {/* Signup */}
          <Route path="/signup" element={<SignUp />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<NotesDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
