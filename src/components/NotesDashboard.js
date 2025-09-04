import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../note.css";

const BACKEND_URL = "https://note-keeper-backend-gaz2.onrender.com";

export default function NotesDashboard({ token: propToken, email: propEmail, name: propName, onSignOut }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authToken, setAuthToken] = useState(propToken || "");
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState(propName || "");
  const [displayEmail, setDisplayEmail] = useState(propEmail || "");

  const location = useLocation();
  const navigate = useNavigate();

  // Decode JWT payload without verifying
  const decodeJwt = (token) => {
    try {
      const payloadB64 = token.split(".")[1];
      const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  // 1️⃣ On mount: check URL params for Google OAuth token
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    const urlName = params.get("name");
    const urlEmail = params.get("email");

    if (urlToken) {
      // Save in state and localStorage
      setAuthToken(urlToken);
      if (urlName) setDisplayName(urlName);
      if (urlEmail) setDisplayEmail(urlEmail);

      localStorage.setItem("token", urlToken);
      if (urlName) localStorage.setItem("name", urlName);
      if (urlEmail) localStorage.setItem("email", urlEmail);

      // Clean URL
      navigate("/dashboard", { replace: true });
      return;
    }

    // Fallback: use prop or localStorage
    const t = propToken || localStorage.getItem("token");
    const n = propName || localStorage.getItem("name");
    const e = propEmail || localStorage.getItem("email");

    if (t) setAuthToken(t);
    if (n) setDisplayName(n);
    if (e) setDisplayEmail(e);

    if (!t) {
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // 2️⃣ Fetch notes whenever token is available
  useEffect(() => {
    if (!authToken) return;

    const decoded = decodeJwt(authToken);
    if (decoded?.id) setUserId(decoded.id);
    if (!displayName && decoded?.name) setDisplayName(decoded.name);
    if (!displayEmail && decoded?.email) setDisplayEmail(decoded.email);

    fetchNotes(authToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  const fetchNotes = async (token) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BACKEND_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(Array.isArray(res.data.notes) ? res.data.notes : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to fetch notes");
      if (err.response?.status === 401 || err.response?.status === 403) doSignOut();
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setError("");
    try {
      const res = await axios.post(
        `${BACKEND_URL}/notes`,
        { content: newNote },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setNotes((prev) => [res.data.note, ...prev]);
      setNewNote("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to add note");
      if (err.response?.status === 401 || err.response?.status === 403) doSignOut();
    }
  };

  const handleDeleteNote = async (id) => {
    setError("");
    try {
      await axios.delete(`${BACKEND_URL}/notes/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete note");
      if (err.response?.status === 401 || err.response?.status === 403) doSignOut();
    }
  };

  const doSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    if (typeof onSignOut === "function") onSignOut();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="loading-spinner">⏳</div>
        <h2>Dashboard</h2>
        <button className="signout-btn" onClick={doSignOut}>Sign Out</button>
      </div>

      <div className="welcome-card">
        <h3>Welcome, <span className="highlight">{displayName || "user"}</span>!</h3>
        <p>Email: {displayEmail || "unknown"}</p>
      </div>

      <div className="note-input-container">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter your note"
          className="note-input"
        />
        <button className="create-note-btn" onClick={handleAddNote}>Create Note</button>
      </div>

      <div className="notes-section">
        <h4>Notes</h4>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : notes.length === 0 ? (
          <p>No notes yet.</p>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="note-card">
              <span>{n.content}</span>
              <button className="delete-btn" onClick={() => handleDeleteNote(n.id)}>🗑</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
