import { createContext, useContext, useState, useEffect, useCallback } from "react";

const WaterContext = createContext();

const GLASS_ML = 300; // ml por copo
const DAILY_GOAL = 2000; // meta diária em ml

export function WaterProvider({ children }) {
  const [drinks, setDrinks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("water-state-v2"));
      const today = new Date().toDateString();
      if (saved && saved.date === today) return saved.drinks;
    } catch {}
    return [];
  });

  // salva no localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem("water-state-v2", JSON.stringify({ drinks, date: today }));
  }, [drinks]);

  const addDrink = useCallback(() => {
    const now = new Date();
    setDrinks((prev) => [...prev, { time: now.toISOString(), ml: GLASS_ML }]);
    window.electronAPI?.dismissWaterNotification();
  }, []);

  const resetDrinks = useCallback(() => setDrinks([]), []);

  const totalMl = drinks.reduce((acc, d) => acc + d.ml, 0);
  const glassCount = drinks.length;
  const percent = Math.min(100, Math.round((totalMl / DAILY_GOAL) * 100));
  const lastDrinkTime = drinks.length > 0 ? new Date(drinks[drinks.length - 1].time) : null;
  const goalReached = totalMl >= DAILY_GOAL;

  // Compatibilidade com useWaterReminder (que usa cups)
  const cups = Array(Math.ceil(DAILY_GOAL / GLASS_ML)).fill(false).map((_, i) => i < glassCount);
  const cupsDrank = glassCount;
  const totalCups = Math.ceil(DAILY_GOAL / GLASS_ML);

  return (
    <WaterContext.Provider value={{
      drinks,
      addDrink,
      resetDrinks,
      totalMl,
      glassCount,
      percent,
      lastDrinkTime,
      goalReached,
      GLASS_ML,
      DAILY_GOAL,
      // Compatibilidade
      cups,
      cupsDrank,
      totalCups,
    }}>
      {children}
    </WaterContext.Provider>
  );
}

export function useWaterContext() {
  const ctx = useContext(WaterContext);
  if (!ctx) throw new Error("useWaterContext precisa estar dentro de WaterProvider");
  return ctx;
}
