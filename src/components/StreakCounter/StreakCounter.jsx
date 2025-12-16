import { useState, useEffect } from "react";
import "./StreakCounter.css";

const STORAGE_KEY = "streak-data";

function getToday() {
  return new Date().toISOString().split("T")[0]; // "2024-01-15"
}

function getDaysDiff(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export default function StreakCounter() {
  const [streakData, setStreakData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastVisit: null,
    };
  });

  useEffect(() => {
    const today = getToday();
    const { lastVisit, currentStreak, longestStreak } = streakData;

    if (lastVisit === today) {
      // Já visitou hoje, não faz nada
      return;
    }

    let newStreak = currentStreak;
    let newLongest = longestStreak;

    if (!lastVisit) {
      // Primeira visita
      newStreak = 1;
    } else {
      const daysDiff = getDaysDiff(lastVisit, today);
      if (daysDiff === 1) {
        // Dia consecutivo
        newStreak = currentStreak + 1;
      } else if (daysDiff > 1) {
        // Perdeu o streak
        newStreak = 1;
      }
    }

    if (newStreak > newLongest) {
      newLongest = newStreak;
    }

    const newData = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastVisit: today,
    };

    setStreakData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }, []);

  // Salvar quando muda
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(streakData));
  }, [streakData]);

  const { currentStreak, longestStreak } = streakData;

  // Emoji baseado no streak
  const getStreakEmoji = () => {
    if (currentStreak >= 30) return "👑";
    if (currentStreak >= 14) return "🔥";
    if (currentStreak >= 7) return "⚡";
    if (currentStreak >= 3) return "✨";
    return "🌱";
  };

  // Mensagem motivacional
  const getMessage = () => {
    if (currentStreak >= 30) return "Lendário!";
    if (currentStreak >= 14) return "Imparável!";
    if (currentStreak >= 7) return "Em chamas!";
    if (currentStreak >= 3) return "Boa sequência!";
    if (currentStreak >= 1) return "Continue assim!";
    return "Comece hoje!";
  };

  return (
    <div className="streak-card">
      <div className="streak-emoji">{getStreakEmoji()}</div>
      <div className="streak-number">{currentStreak}</div>
      <div className="streak-label">dias seguidos</div>
      <div className="streak-message">{getMessage()}</div>
      <div className="streak-best">
        Recorde: {longestStreak} dias
      </div>
    </div>
  );
}
