import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { useTasks } from "../../hooks/useTasks";
import { useWeeks } from "../../hooks/useWeeks";
import Modal from "../../components/Modal/Modal";
import "./WeekKanban.css";

export default function WeekKanban() {
  const { weekId } = useParams();
  const navigate = useNavigate();
  const { tasks, loading, error, addTask, moveTask, deleteTask } = useTasks(parseInt(weekId));
  const { weeks } = useWeeks();
  
  const [weekTitle, setWeekTitle] = useState(`Semana ${weekId}`);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "todo" });
  const [showModal, setShowModal] = useState(false);
  const [draggedOver, setDraggedOver] = useState(null);

  useEffect(() => {
    if (weeks.length > 0) {
      const week = weeks.find(w => w.id === parseInt(weekId));
      if (week) {
        setWeekTitle(week.title);
      }
    }
  }, [weeks, weekId]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      try {
        await addTask({
          title: newTask.title,
          description: newTask.description,
          status: newTask.status
        });
        
        setNewTask({ title: "", description: "", status: "todo" });
        setShowModal(false);
      } catch (err) {
        console.error('Erro ao adicionar task:', err);
      }
    }
  };

  const handleTaskMove = async (taskId, fromStatus, toStatus) => {
    try {
      await moveTask(taskId, fromStatus, toStatus);
    } catch (err) {
      console.error('Erro ao mover task:', err);
    }
  };

  const handleDeleteTask = async (taskId, status) => {
    try {
      await deleteTask(taskId, status);
    } catch (err) {
      console.error('Erro ao deletar task:', err);
    }
  };

  const columns = [
    { key: 'todo', title: 'A Fazer', color: '#ff6b6b' },
    { key: 'inProgress', title: 'Em Progresso', color: '#4ecdc4' },
    { key: 'done', title: 'Concluído', color: '#45b7d1' }
  ];

  if (loading) {
    return (
      <div className="kanban-container">
        <div className="loading-message">
          <h2>Carregando tasks...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kanban-container">
        <div className="error-message">
          <h2>Erro ao carregar tasks</h2>
          <p>{error}</p>
          <button className="back-btn" onClick={() => navigate('/tasks')}>
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <button className="back-btn" onClick={() => navigate('/tasks')}>
          ← Voltar
        </button>
        <h1>{weekTitle}</h1>
        <button 
          className="add-task-btn" 
          onClick={() => setShowModal(true)}
        >
          + Nova Task
        </button>
      </div>

      <div className="kanban-board">
        {columns.map(column => (
          <div 
            key={column.key} 
            className={`kanban-column ${draggedOver === column.key ? 'drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDraggedOver(column.key);
            }}
            onDragLeave={() => setDraggedOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDraggedOver(null);
              const data = JSON.parse(e.dataTransfer.getData('text/plain'));
              if (data.fromStatus !== column.key) {
                handleTaskMove(data.taskId, data.fromStatus, column.key);
              }
            }}
          >
            <div 
              className="column-header" 
              style={{ backgroundColor: column.color }}
            >
              <h3>{column.title}</h3>
              <span className="task-count">{tasks[column.key].length}</span>
            </div>
            <div className="column-content">
              {tasks[column.key].map(task => (
                <div 
                  key={task.id} 
                  className="task-card"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({
                      taskId: task.id,
                      fromStatus: column.key
                    }));
                    e.dataTransfer.effectAllowed = 'move';
                    e.target.classList.add('dragging');
                  }}
                  onDragEnd={(e) => {
                    e.target.classList.remove('dragging');
                  }}
                >
                  <div className="task-header">
                    <h4>{task.title}</h4>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteTask(task.id, column.key)}
                      title="Excluir task"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Nova Task"
      >
        <form onSubmit={handleAddTask} className="task-form">
          <div className="form-group">
            <label htmlFor="task-title">Título da Task</label>
            <input
              id="task-title"
              type="text"
              placeholder="Digite o título da task"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="task-description">Descrição (opcional)</label>
            <textarea
              id="task-description"
              placeholder="Digite uma descrição para a task"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              rows={4}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="task-status">Status Inicial</label>
            <select
              id="task-status"
              value={newTask.status}
              onChange={(e) => setNewTask({...newTask, status: e.target.value})}
            >
              <option value="todo">A Fazer</option>
              <option value="inProgress">Em Progresso</option>
              <option value="done">Concluído</option>
            </select>
          </div>
          
          <div className="form-buttons">
            <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
              Cancelar
            </button>
            <button type="submit" className="submit-btn">
              Adicionar Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
