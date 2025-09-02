import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../note.css";

export default function NotesDashboard({ token: propToken, email: propEmail, name: propName, onSignOut }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authToken, setAuthToken] = useState(propToken || localStorage.getItem("token") || "");
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState(propName || localStorage.getItem("name") || "");
  const [displayEmail, setDisplayEmail] = useState(propEmail || localStorage.getItem("email") || "");

  const location = useLocation();
  const navigate = useNavigate();

  // Utility: decode JWT payload (no verification, just decode)
  const decodeJwt = (t) => {
    try {
      const payloadB64 = t.split(".")[1];
      const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(json);
    } catch (err) {
      console.warn("Failed to decode JWT:", err);
      return null;
    }
  };

  // 1) If Google redirected with token in URL, save it and clean URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    const urlName = params.get("name");
    const urlEmail = params.get("email");

    if (urlToken) {
      // persist token + user info
      localStorage.setItem("token", urlToken);
      if (urlName) localStorage.setItem("name", urlName);
      if (urlEmail) localStorage.setItem("email", urlEmail);

      setAuthToken(urlToken);
      if (urlName) setDisplayName(urlName);
      if (urlEmail) setDisplayEmail(urlEmail);

      // remove query params so they don't stay in the URL
      navigate("/dashboard", { replace: true });
      return;
    }

    // fallback — use prop or localStorage
    const t = propToken || localStorage.getItem("token");
    if (t && t !== authToken) {
      setAuthToken(t);
      const decoded = decodeJwt(t);
      if (decoded?.name) setDisplayName(decoded.name);
      if (decoded?.email) setDisplayEmail(decoded.email);
      if (decoded?.id) setUserId(decoded.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, propToken, navigate]);

  // 2) Whenever authToken changes, decode and fetch notes
  useEffect(() => {
    if (!authToken) {
      // no token → redirect to login
      navigate("/login");
      return;
    }

    const decoded = decodeJwt(authToken);
    if (!decoded) {
      console.warn("Token present but could not decode — forcing signout");
      doSignOut();
      return;
    }

    // Set userId/display fields from token if not set
    if (decoded.id && decoded.id !== userId) setUserId(decoded.id);
    if (decoded.name && !displayName) setDisplayName(decoded.name);
    if (decoded.email && !displayEmail) setDisplayEmail(decoded.email);

    console.log("Using token (truncated):", authToken.slice(0, 30) + "...");
    console.log("Decoded token payload:", decoded);

    fetchNotes(authToken);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  // fetch notes from backend
  const fetchNotes = async (t) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/notes", {
        headers: { Authorization: `Bearer ${t}` },
      });

      // Expecting backend to return { notes: [...] }
      const arr = Array.isArray(res.data.notes) ? res.data.notes : [];
      console.log("Fetched notes:", arr);
      setNotes(arr);
    } catch (err) {
      console.error("Fetch notes failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to fetch notes");
      // If unauthorized → sign out
      if (err.response?.status === 401 || err.response?.status === 403) {
        doSignOut();
      }
    } finally {
      setLoading(false);
    }
  };

  // Add note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setError("");
    try {
      const res = await axios.post(
        "http://localhost:5000/notes",
        { content: newNote },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const created = res.data.note;
      setNotes((prev) => [created, ...prev]);
      setNewNote("");
    } catch (err) {
      console.error("Add note failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to add note");
      if (err.response?.status === 401 || err.response?.status === 403) doSignOut();
    }
  };

  // Delete note
  const handleDeleteNote = async (id) => {
    setError("");
    try {
      await axios.delete(`http://localhost:5000/notes/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Delete note failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to delete note");
      if (err.response?.status === 401 || err.response?.status === 403) doSignOut();
    }
  };

  // signout helper
  const doSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    // (optional) localStorage.removeItem("persist"); // if you implemented persist
    if (typeof onSignOut === "function") onSignOut();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="loading-spinner">⏳</div>
        <h2>Dashboard</h2>
        <button className="signout-btn" onClick={doSignOut}>
          Sign Out
        </button>
      </div>

      <div className="welcome-card">
        <h3>
          Welcome, <span className="highlight">{displayName || "user"}</span> !
        </h3>
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
        <button className="create-note-btn" onClick={handleAddNote}>
          Create Note
        </button>
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
              <button className="delete-btn" onClick={() => handleDeleteNote(n.id)}>
                🗑
              </button>
            </div>
          ))
        )}
      </div>

      {/* Debug info (remove when done) */}
      {/* <div style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
        <strong>Debug:</strong>
        <div>authToken present: {!!authToken ? "yes" : "no"}</div>
        <div>decoded userId: {userId ?? "unknown"}</div>
        <div>displayName: {displayName}</div>
        <div>displayEmail: {displayEmail}</div>
      </div> */}
    </div>
  );
}
