import { createContext, useContext, useState, useEffect, useCallback } from "react";

const WaterContext = createContext();

export function WaterProvider({ totalCups = 6, children }) {
  const [cups, setCups] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("water-state"));
      const today = new Date().toDateString();
      if (saved && saved.date === today) return saved.cups;
    } catch {}
    return Array(totalCups).fill(false);
  });

  // salva no localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem("water-state", JSON.stringify({ cups, date: today }));
  }, [cups]);

  const toggleCup = useCallback((index) => {
    setCups((prev) => {
      const newCups = [...prev];
      const wasEmpty = !prev[index];
      newCups[index] = !newCups[index];

      // Se marcou como "bebido", fecha a notificação imediatamente
      if (wasEmpty && newCups[index]) {
        window.electronAPI?.dismissWaterNotification();
      }

      return newCups;
    });
  }, []);

  const resetCups = useCallback(() => setCups(Array(totalCups).fill(false)), [totalCups]);

  const cupsDrank = cups.filter(Boolean).length;
  const percent = Math.round((cupsDrank / totalCups) * 100);

  return (
    <WaterContext.Provider value={{ cups, toggleCup, resetCups, totalCups, cupsDrank, percent }}>
      {children}
    </WaterContext.Provider>
  );
}

export function useWaterContext() {
  const ctx = useContext(WaterContext);
  if (!ctx) throw new Error("useWaterContext precisa estar dentro de WaterProvider");
  return ctx;
}
