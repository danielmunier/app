import { useEffect, useRef } from "react";
import { useWaterContext } from "../../context/WaterProvider";
import { useNotificationContext } from "../../context/NotificationContext";
import { NOTIFICATION_TYPES } from "../../hooks/useNotifications";

export function useWaterReminder(interval = 10000) {
  const { cups } = useWaterContext();
  const { addNotification } = useNotificationContext();
  const intervalRef = useRef(null);

  useEffect(() => {
    const remindToDrink = () => {
        window.electronAPI.showNotification("", "Hora de beber água💧");

      const empty = cups.filter((c) => !c).length;
      if (empty > 0) {
        addNotification({
          type: NOTIFICATION_TYPES.INFO,
          title: "Hora de se hidratar 💧",
          message: `Você ainda tem ${empty} copo(s) para beber hoje!`,
        });
      }
    };

    remindToDrink(); // dispara uma vez ao abrir
    intervalRef.current = setInterval(remindToDrink, interval);

    return () => clearInterval(intervalRef.current);
  }, [cups, interval, addNotification]);
}
