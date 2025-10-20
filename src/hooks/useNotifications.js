import { useState, useCallback, useEffect } from 'react';

export const NOTIFICATION_TYPES = {
  UPDATE: 'update',
  TASK: 'task',
  SYSTEM: 'system',
  INFO: 'info'
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: generateId(),
      type: NOTIFICATION_TYPES.INFO,
      title: '',
      message: '',
      time: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(notif => !notif.read).length;
  const displayNotifications = notifications.slice(0, 10);

  const addUpdateNotification = useCallback((version, message) => {
    return addNotification({
      type: NOTIFICATION_TYPES.UPDATE,
      title: `Atualização disponível v${version}`,
      message: message || `Nova versão ${version} está disponível para download`,
      time: new Date().toISOString()
    });
  }, [addNotification]);

  const addTaskNotification = useCallback((taskTitle, message) => {
    return addNotification({
      type: NOTIFICATION_TYPES.TASK,
      title: `Nova tarefa: ${taskTitle}`,
      message: message || 'Uma nova tarefa foi adicionada',
      time: new Date().toISOString()
    });
  }, [addNotification]);

  const addSystemNotification = useCallback((title, message) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SYSTEM,
      title,
      message,
      time: new Date().toISOString()
    });
  }, [addNotification]);

  useEffect(() => {
    const saved = localStorage.getItem('app-notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app-notifications', JSON.stringify(notifications));
  }, [notifications]);

  return {
    notifications: displayNotifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    addUpdateNotification,
    addTaskNotification,
    addSystemNotification
  };
}
