import { useState, useEffect } from "react";

export function useKanban() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("kanban-tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (status) => {
    const newTask = {
      id: crypto.randomUUID(),
      title: "Nova tarefa",
      status,
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const moveTask = (id, newStatus) => {
    updateTask(id, { status: newStatus });
  };

  return { tasks, addTask, updateTask, deleteTask, moveTask };
}
