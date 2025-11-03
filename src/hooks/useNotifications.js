import { useState, useCallback, useEffect } from "react";

export const NOTIFICATION_TYPES = {
  UPDATE: "update",
  TASK: "task",
  SYSTEM: "system",
  INFO: "info",
};

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  // === 🔔 FUNÇÕES BASE ===
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: generateId(),
      type: NOTIFICATION_TYPES.INFO,
      title: "",
      message: "",
      time: new Date().toISOString(),
      read: false,
      ...notification,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    return newNotification.id;
  }, []);

  const removeNotification = useCallback(
    (id) => setNotifications((prev) => prev.filter((n) => n.id !== id)),
    []
  );

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayNotifications = notifications.slice(0, 10);

  // === 📦 NOTIFICAÇÕES ESPECÍFICAS ===
  const addUpdateNotification = useCallback(
    (version, message) =>
      addNotification({
        type: NOTIFICATION_TYPES.UPDATE,
        title: `Atualização disponível v${version}`,
        message: message || `Nova versão ${version} está disponível.`,
      }),
    [addNotification]
  );

  const addSystemNotification = useCallback(
    (title, message) =>
      addNotification({
        type: NOTIFICATION_TYPES.SYSTEM,
        title,
        message,
      }),
    [addNotification]
  );

  const addErrorNotification = useCallback(
    (message) =>
      addNotification({
        type: NOTIFICATION_TYPES.SYSTEM,
        title: "Erro de atualização ⚠️",
        message,
      }),
    [addNotification]
  );

  // === 💾 LOCAL STORAGE ===
  useEffect(() => {
    const saved = localStorage.getItem("app-notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (err) {
        console.error("Erro ao carregar notificações:", err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("app-notifications", JSON.stringify(notifications));
  }, [notifications]);

  // === 🧠 INTEGRAÇÃO COM ELECTRON ===
  useEffect(() => {
    if (!window.electronAPI) return;

    const { 
      onCheckingForUpdate, 
      onUpdateAvailable, 
      onUpdateDownloaded, 
      onUpdateNotAvailable, 
      onUpdateError 
    } = window.electronAPI;

    onCheckingForUpdate(() =>
      addSystemNotification("Verificando atualizações...", "Aguarde um momento.")
    );

    onUpdateAvailable((info) =>
      addUpdateNotification(
        info.version,
        `Versão ${info.version} (${info.releaseName}) disponível.`
      )
    );

    onUpdateDownloaded((info) =>
      addSystemNotification(
        "Atualização pronta 🎉",
        `Versão ${info.version} foi baixada. Reinicie o app para instalar.`
      )
    );

    onUpdateNotAvailable((info) =>
      addSystemNotification(
        "App atualizado",
        `Nenhuma nova versão encontrada (${info.version || "atual"}).`
      )
    );

    onUpdateError((errMessage) =>
      addErrorNotification(errMessage || "Erro desconhecido.")
    );
  }, [addSystemNotification, addUpdateNotification, addErrorNotification]);

  return {
    notifications: displayNotifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    addUpdateNotification,
    addSystemNotification,
  };
}
