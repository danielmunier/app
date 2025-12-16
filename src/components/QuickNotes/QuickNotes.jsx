import { useState, useEffect } from "react";
import "./QuickNotes.css";

const STORAGE_KEY = "quick-notes";

export default function QuickNotes() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: crypto.randomUUID(),
      text: newNote.trim(),
      createdAt: Date.now(),
    };
    setNotes([note, ...notes]);
    setNewNote("");
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  };

  return (
    <div className="quick-notes-card">
      <div className="quick-notes-header">
        <h3>Notas Rápidas</h3>
        <span className="notes-count">{notes.length}</span>
      </div>

      {/* Input para nova nota */}
      <div className="quick-notes-input">
        <input
          type="text"
          placeholder="Escreva uma nota..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={addNote} disabled={!newNote.trim()}>
          +
        </button>
      </div>

      {/* Lista de notas */}
      <div className="quick-notes-list">
        {notes.slice(0, 4).map((note) => (
          <div key={note.id} className="quick-note-item">
            <span className="note-text">{note.text}</span>
            <button
              className="note-delete"
              onClick={() => deleteNote(note.id)}
              title="Remover"
            >
              ×
            </button>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="no-notes">Nenhuma nota ainda</p>
        )}
        {notes.length > 4 && (
          <p className="more-notes">+{notes.length - 4} mais...</p>
        )}
      </div>
    </div>
  );
}
