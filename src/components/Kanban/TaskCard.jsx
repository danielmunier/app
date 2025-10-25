import { useState } from "react";

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(task.title);

  const handleSave = () => {
    const trimmed = tempTitle.trim();
    if (trimmed !== "") {
      onUpdate(task.id, { title: trimmed });
    } else {
      setTempTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setTempTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
  };

  return (
    <div
      className="task-card"
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="task-header">
        {isEditing ? (
          <input
            className="task-input"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <h4
            className="task-title"
            onClick={() => setIsEditing(true)}
            title="Clique para editar"
          >
            {task.title}
          </h4>
        )}
        <button className="delete-btn" onClick={() => onDelete(task.id)}>
          ✕
        </button>
      </div>
    </div>
  );
}
