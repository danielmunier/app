import { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';

export function useTasks(weekId) {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar tasks do IndexedDB
  const loadTasks = useCallback(async () => {
    if (!weekId) return;
    
    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskService.getTasksByWeek(weekId);
      setTasks(tasksData);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [weekId]);

  // Adicionar nova task
  const addTask = useCallback(async (taskData) => {
    try {
      setError(null);
      const newTask = {
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || 'todo',
        weekId: weekId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const taskId = await taskService.addTask(newTask);
      const taskWithId = { ...newTask, id: taskId };
      
      setTasks(prev => ({
        ...prev,
        [newTask.status]: [...prev[newTask.status], taskWithId]
      }));
      
      return taskWithId;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao adicionar task:', err);
      throw err;
    }
  }, [weekId]);

  // Atualizar task
  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      setError(null);
      await taskService.updateTask(taskId, {
        ...taskData,
        updatedAt: new Date().toISOString()
      });
      
      setTasks(prev => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach(status => {
          newTasks[status] = newTasks[status].map(task =>
            task.id === taskId ? { ...task, ...taskData } : task
          );
        });
        return newTasks;
      });
    } catch (err) {
      setError(err.message);
      console.error('Erro ao atualizar task:', err);
      throw err;
    }
  }, []);

  // Mover task entre colunas
  const moveTask = useCallback(async (taskId, fromStatus, toStatus) => {
    try {
      setError(null);
      await taskService.moveTask(taskId, toStatus);
      
      setTasks(prev => {
        const newTasks = { ...prev };
        
        // Remover da coluna origem
        const task = newTasks[fromStatus].find(t => t.id === taskId);
        if (task) {
          newTasks[fromStatus] = newTasks[fromStatus].filter(t => t.id !== taskId);
          newTasks[toStatus] = [...newTasks[toStatus], { ...task, status: toStatus }];
        }
        
        return newTasks;
      });
    } catch (err) {
      setError(err.message);
      console.error('Erro ao mover task:', err);
      throw err;
    }
  }, []);

  // Deletar task
  const deleteTask = useCallback(async (taskId, status) => {
    try {
      setError(null);
      await taskService.deleteTask(taskId);
      
      setTasks(prev => ({
        ...prev,
        [status]: prev[status].filter(task => task.id !== taskId)
      }));
    } catch (err) {
      setError(err.message);
      console.error('Erro ao deletar task:', err);
      throw err;
    }
  }, []);

  // Carregar tasks na inicialização
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    refreshTasks: loadTasks
  };
}
