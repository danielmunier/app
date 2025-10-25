import TaskCard from "./TaskCard";
import "./kanban.css"

export default function Column({
  title,
  status,
  tasks,
  onAdd,
  onUpdate,
  onDelete,
  onMove,
}) {
  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    onMove(id, status);
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  return (
    <div
      className="column"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="column-header">
        <h3>{title}</h3>
        <button className="add-btn" onClick={() => onAdd(status)}>
          ＋
        </button>
      </div>

      <div className="column-content">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
