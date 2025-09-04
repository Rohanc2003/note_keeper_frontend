import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import NotesDashboard from "./components/NotesDashboard";
import OAuthHandler from "./components/OAuthHandler"; // ✅ use only this one

function App() {
  return (
    <Router>
      <div className="p-6">
        <Routes>
          {/* Default route → Signup */}
          <Route path="/" element={<Navigate to="/signup" />} />

          {/* Signup */}
          <Route path="/signup" element={<SignUp />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<NotesDashboard />} />

          {/* OAuth redirect handler */}
          <Route path="/oauth" element={<OAuthHandler />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
