import { useState, useEffect, useRef } from "react";
import { useNotificationContext } from "../context/NotificationContext";
import { NOTIFICATION_TYPES } from "./useNotifications";

export function useWater(totalCups = 6, reminderInterval = 1000 * 60 * 60) {
  // estado dos copos (true = cheio/bebido)
  const [cups, setCups] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("water-state"));
      const today = new Date().toDateString();
      if (saved && saved.date === today) return saved.cups;
    } catch {}
    return Array(totalCups).fill(false);
  });

  // contexto de notificação
  const { addNotification } = useNotificationContext();
  const intervalRef = useRef(null);

  // salvar no localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem("water-state", JSON.stringify({ cups, date: today }));
  }, [cups]);

  // lembrete periódico
  useEffect(() => {

    const remindToDrink = () => {
      const emptyCount = cups.filter((c) => !c).length;
      if (emptyCount > 0) {
        addNotification({
          type: NOTIFICATION_TYPES.INFO,
          title: "Hora de se hidratar 💧",
          message: "Beba um copo de água para manter-se saudável!",
        });
      }
    };

    remindToDrink(); // dispara uma vez ao abrir
    intervalRef.current = setInterval(remindToDrink, reminderInterval);

    return () => clearInterval(intervalRef.current);
  }, [cups, addNotification, reminderInterval]);

  // alternar copo
  const toggleCup = (index) => {
    setCups((prev) => {
      const newCups = [...prev];
      newCups[index] = !newCups[index];
      return newCups;
    });
  };

  // resetar
  const resetCups = () => setCups(Array(totalCups).fill(false));

  return {
    cups,
    totalCups,
    cupsDrank: cups.filter(Boolean).length,
    percent: Math.round((cups.filter(Boolean).length / totalCups) * 100),
    toggleCup,
    resetCups,
  };
}
