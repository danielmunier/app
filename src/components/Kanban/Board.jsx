import { useKanban } from "../../hooks/useKanban";
import Column from "./Column";

export default function Board() {
  const { tasks, addTask, updateTask, deleteTask, moveTask } = useKanban();

  const statuses = [
    { key: "todo", label: "Todo" },
    { key: "inprogress", label: "In Progress" },
    { key: "inreview", label: "In Review" },
    { key: "done", label: "Done" },
  ];

  return (
    <div className="board">
      {statuses.map((s) => (
        <Column
          key={s.key}
          title={s.label}
          status={s.key}
          tasks={tasks.filter((t) => t.status === s.key)}
          onAdd={addTask}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onMove={moveTask}
        />
      ))}
    </div>
  );
}
