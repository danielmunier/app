import { createContext, useContext, useState, useEffect, useCallback } from "react";

const WaterContext = createContext();

const GLASS_ML = 300; // ml por copo
const DAILY_GOAL = 2000; // meta diária em ml

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function WaterProvider({ children }) {
  const [drinks, setDrinks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("water-state-v2"));
      const today = new Date().toDateString();
      if (saved && saved.date === today) return saved.drinks;
    } catch {}
    return [];
  });

  // Streak de hidratação
  const [streakData, setStreakData] = useState(() => {
    try {
      const saved = localStorage.getItem("water-streak");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastGoalDate: null,
    };
  });

  // Salva drinks no localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem("water-state-v2", JSON.stringify({ drinks, date: today }));
  }, [drinks]);

  // Salva streak no localStorage
  useEffect(() => {
    localStorage.setItem("water-streak", JSON.stringify(streakData));
  }, [streakData]);

  // Verifica e atualiza streak quando meta é atingida
  const checkAndUpdateStreak = useCallback((totalMl) => {
    if (totalMl >= DAILY_GOAL) {
      const today = getToday();
      const yesterday = getYesterday();

      setStreakData((prev) => {
        // Já registrou hoje
        if (prev.lastGoalDate === today) {
          return prev;
        }

        let newStreak = prev.currentStreak;

        if (prev.lastGoalDate === yesterday) {
          // Dia consecutivo - incrementa streak
          newStreak = prev.currentStreak + 1;
        } else if (prev.lastGoalDate !== today) {
          // Perdeu dias ou primeira vez - começa do 1
          newStreak = 1;
        }

        const newLongest = Math.max(newStreak, prev.longestStreak);

        return {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastGoalDate: today,
        };
      });
    }
  }, []);

  // Verifica streak no início do dia (para resetar se perdeu)
  useEffect(() => {
    const today = getToday();
    const yesterday = getYesterday();

    if (streakData.lastGoalDate &&
        streakData.lastGoalDate !== today &&
        streakData.lastGoalDate !== yesterday) {
      // Perdeu mais de um dia - reseta streak
      setStreakData((prev) => ({
        ...prev,
        currentStreak: 0,
      }));
    }
  }, []);

  const addDrink = useCallback(() => {
    const now = new Date();
    setDrinks((prev) => {
      const newDrinks = [...prev, { time: now.toISOString(), ml: GLASS_ML }];
      const newTotal = newDrinks.reduce((acc, d) => acc + d.ml, 0);
      // Verifica streak após adicionar
      setTimeout(() => checkAndUpdateStreak(newTotal), 0);
      return newDrinks;
    });
    window.electronAPI?.dismissWaterNotification();
  }, [checkAndUpdateStreak]);

  const resetDrinks = useCallback(() => setDrinks([]), []);

  const totalMl = drinks.reduce((acc, d) => acc + d.ml, 0);
  const glassCount = drinks.length;
  const percent = Math.min(100, Math.round((totalMl / DAILY_GOAL) * 100));
  const lastDrinkTime = drinks.length > 0 ? new Date(drinks[drinks.length - 1].time) : null;
  const goalReached = totalMl >= DAILY_GOAL;

  // Verifica streak quando componente monta (caso já tenha atingido meta)
  useEffect(() => {
    if (totalMl >= DAILY_GOAL) {
      checkAndUpdateStreak(totalMl);
    }
  }, []);

  // Compatibilidade com useWaterReminder
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
      // Streak
      waterStreak: streakData.currentStreak,
      waterLongestStreak: streakData.longestStreak,
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
