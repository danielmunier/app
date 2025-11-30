import { useEffect, useRef, useCallback } from "react";
import { useWaterContext } from "../../context/WaterProvider";
import { useNotificationContext } from "../../context/NotificationContext";
import { NOTIFICATION_TYPES } from "../../hooks/useNotifications";

/**
 * Hook de lembrete de hidratação
 *
 * Comportamento:
 * - Dispara notificação a cada `interval` ms
 * - NÃO dispara se todos os copos estiverem cheios (meta completa)
 * - Ao beber água: fecha notificação + reseta timer (sem disparar nova notificação)
 * - Notificação fica visível por até 3 minutos ou até marcar que bebeu
 */
export function useWaterReminder(interval = 60000) {
  const { cups, cupsDrank, totalCups } = useWaterContext();
  const { addNotification } = useNotificationContext();

  const intervalRef = useRef(null);
  const cupsRef = useRef(cups);
  const isFirstRender = useRef(true);

  // Mantém ref atualizada sem re-criar interval
  useEffect(() => {
    cupsRef.current = cups;
  }, [cups]);

  // Função de reminder (estável)
  const remindToDrink = useCallback(() => {
    const currentCups = cupsRef.current;
    const empty = currentCups.filter((c) => !c).length;

    // Só notifica se houver copos vazios
    if (empty > 0) {
      window.electronAPI?.showNotification("", "Hora de beber água 💧");
      addNotification({
        type: NOTIFICATION_TYPES.INFO,
        title: "Hora de se hidratar 💧",
        message: `Você ainda tem ${empty} copo(s) para beber hoje!`,
      });
    }
  }, [addNotification]);

  // Inicia o interval (apenas uma vez)
  useEffect(() => {
    intervalRef.current = setInterval(remindToDrink, interval);
    return () => clearInterval(intervalRef.current);
  }, [interval, remindToDrink]);

  // Reseta timer ao beber água (sem disparar notificação)
  useEffect(() => {
    // Ignora primeira renderização
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Reseta o timer quando quantidade de copos bebidos muda
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(remindToDrink, interval);
    }
  }, [cupsDrank, interval, remindToDrink]);

  return {
    isGoalComplete: cupsDrank === totalCups,
    cupsRemaining: totalCups - cupsDrank
  };
}
