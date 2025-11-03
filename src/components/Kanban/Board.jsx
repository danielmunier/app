import { useKanban } from "../../hooks/useKanban";
import Column from "./Column";
import ProgressBar from "./Progressbar";

export default function Board() {
  const { tasks, addTask, updateTask, deleteTask, moveTask } = useKanban();

  const statuses = [
    { key: "todo", label: "Para fazer" },
    { key: "inprogress", label: "Em progresso" },
    { key: "inreview", label: "Revisando" },
    { key: "done", label: "Finalizado" },
  ];

  return (
    <div className="board-container">
    <ProgressBar tasks={tasks || []} />
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

    </div>
  );
}
