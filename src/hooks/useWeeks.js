import { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';

export function useWeeks() {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar semanas do IndexedDB
  const loadWeeks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const weeksData = await taskService.getAllWeeks();
      
      // Adicionar contagem de tasks para cada semana
      const weeksWithTaskCount = await Promise.all(
        weeksData.map(async (week) => {
          const taskCount = await taskService.getTaskCountByWeek(week.id);
          return {
            ...week,
            taskCount: taskCount.total
          };
        })
      );
      
      setWeeks(weeksWithTaskCount);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar semanas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar nova semana
  const addWeek = useCallback(async (weekData) => {
    try {
      setError(null);
      const newWeek = {
        title: weekData.title || `Semana ${weeks.length + 1}`,
        startDate: weekData.startDate || new Date().toISOString().split('T')[0],
        endDate: weekData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        image: weekData.image || null,
        createdAt: new Date().toISOString()
      };
      
      const weekId = await taskService.addWeek(newWeek);
      const weekWithId = { ...newWeek, id: weekId, taskCount: 0 };
      
      setWeeks(prev => [...prev, weekWithId]);
      return weekWithId;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao adicionar semana:', err);
      throw err;
    }
  }, [weeks.length]);

  // Atualizar semana
  const updateWeek = useCallback(async (weekId, weekData) => {
    try {
      setError(null);
      await taskService.updateWeek(weekId, weekData);
      
      setWeeks(prev => 
        prev.map(week => 
          week.id === weekId ? { ...week, ...weekData } : week
        )
      );
    } catch (err) {
      setError(err.message);
      console.error('Erro ao atualizar semana:', err);
      throw err;
    }
  }, []);

  // Deletar semana
  const deleteWeek = useCallback(async (weekId) => {
    try {
      setError(null);
      await taskService.deleteWeek(weekId);
      
      setWeeks(prev => prev.filter(week => week.id !== weekId));
    } catch (err) {
      setError(err.message);
      console.error('Erro ao deletar semana:', err);
      throw err;
    }
  }, []);

  // Carregar semanas na inicialização
  useEffect(() => {
    loadWeeks();
  }, [loadWeeks]);

  return {
    weeks,
    loading,
    error,
    addWeek,
    updateWeek,
    deleteWeek,
    refreshWeeks: loadWeeks
  };
}
