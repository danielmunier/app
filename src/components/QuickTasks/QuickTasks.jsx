import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./QuickTasks.css";

export default function QuickTasks() {
  const navigate = useNavigate();

  // Ler tasks do localStorage (mesmo key do useKanban)
  const tasks = useMemo(() => {
    const saved = localStorage.getItem("kanban-tasks");
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Calcular progresso
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Pegar tarefas pendentes (to-do e doing) - máximo 3
  const pendingTasks = tasks
    .filter((t) => t.status === "todo" || t.status === "doing")
    .slice(0, 3);

  return (
    <div className="quick-tasks-card">
      <div className="quick-tasks-header">
        <h3>Tarefas</h3>
        <button className="quick-tasks-link" onClick={() => navigate("/tasks")}>
          Ver todas →
        </button>
      </div>

      {/* Barra de progresso */}
      <div className="quick-tasks-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="progress-text">
          {doneTasks}/{totalTasks} concluídas ({progressPercent}%)
        </span>
      </div>

      {/* Lista de tarefas pendentes */}
      <div className="quick-tasks-list">
        {pendingTasks.length > 0 ? (
          pendingTasks.map((task) => (
            <div key={task.id} className={`quick-task-item ${task.status}`}>
              <span className="task-status-dot" />
              <span className="task-title">{task.title}</span>
            </div>
          ))
        ) : (
          <p className="no-tasks">Nenhuma tarefa pendente!</p>
        )}
      </div>
    </div>
  );
}
