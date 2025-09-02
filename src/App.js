import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import NotesDashboard from "./components/NotesDashboard";

// ✅ A wrapper component to handle Google OAuth redirect params globally
function OAuthHandler({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");

    if (token && email) {
      // Save token + user info to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("name", name);
      localStorage.setItem("email", email);

      // Remove query params from URL
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return children;
}

function App() {
  return (
    <Router>
      <OAuthHandler>
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
          </Routes>
        </div>
      </OAuthHandler>
    </Router>
  );
}

export default App;
