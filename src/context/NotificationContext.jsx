// NotificationContext.jsx
import { createContext, useContext } from "react";
import { useNotifications } from "../hooks/useNotifications";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const notif = useNotifications();
  return (
    <NotificationContext.Provider value={notif}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotificationContext precisa do NotificationProvider");
  return ctx;
}
