import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ import navigate
import "../note.css";

export default function NotesDashboard({ token, email, name, onSignOut }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // ✅ create navigate instance

  const fetchNotes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/notes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(Array.isArray(res.data.notes) ? res.data.notes : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await axios.post("http://localhost:5000/notes",
        { content: newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(prev => [...prev, res.data.note]);
      setNewNote("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
  // ✅ Clear localStorage session
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("email");

  if (onSignOut) onSignOut();   // clear token/state if parent passed it
  navigate("/login");           // redirect to /login
};


  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="loading-spinner">⏳</div>
        <h2>Dashboard</h2>
        <button className="signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      {/* Welcome Card */}
      <div className="welcome-card">
        <h3>Welcome, <span className="highlight">{name}</span> !</h3>
        <p>Email: {email}</p>
      </div>

      {/* Input + Create Note */}
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

      {/* Notes Section */}
      <div className="notes-section">
        <h4>Notes</h4>
        {loading ? (
          <p>Loading...</p>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="note-card">
              <span>{n.content}</span>
              <button
                className="delete-btn"
                onClick={() => handleDeleteNote(n.id)}
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
