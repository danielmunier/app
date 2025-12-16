import { useState, useEffect, useRef } from "react";
import "./MiniPomodoro.css";

const WORK_TIME = 25 * 60; // 25 min em segundos
const BREAK_TIME = 5 * 60; // 5 min em segundos

export default function MiniPomodoro() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer acabou
      clearInterval(intervalRef.current);
      handleTimerEnd();
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const handleTimerEnd = () => {
    // Notificação
    if (Notification.permission === "granted") {
      new Notification(isBreak ? "Pausa terminou!" : "Hora da pausa!", {
        body: isBreak ? "Volte ao foco!" : "Descanse 5 minutos.",
        icon: "🍅",
      });
    }

    if (!isBreak) {
      // Acabou o trabalho, começa pausa
      setSessions((prev) => prev + 1);
      setIsBreak(true);
      setTimeLeft(BREAK_TIME);
    } else {
      // Acabou a pausa, volta ao trabalho
      setIsBreak(false);
      setTimeLeft(WORK_TIME);
    }
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK_TIME);
    clearInterval(intervalRef.current);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Progresso circular
  const totalTime = isBreak ? BREAK_TIME : WORK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 45; // raio 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`pomodoro-card ${isBreak ? "break" : ""}`}>
      <div className="pomodoro-header">
        <span className="pomodoro-mode">{isBreak ? "Pausa" : "Foco"}</span>
        <span className="pomodoro-sessions">🍅 {sessions}</span>
      </div>

      {/* Timer circular */}
      <div className="pomodoro-timer">
        <svg className="progress-ring" viewBox="0 0 100 100">
          <circle
            className="progress-ring-bg"
            cx="50"
            cy="50"
            r="45"
          />
          <circle
            className="progress-ring-fill"
            cx="50"
            cy="50"
            r="45"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        <div className="timer-display">{formatTime(timeLeft)}</div>
      </div>

      {/* Controles */}
      <div className="pomodoro-controls">
        <button
          className={`pomodoro-btn ${isRunning ? "pause" : "play"}`}
          onClick={toggleTimer}
        >
          {isRunning ? "⏸" : "▶"}
        </button>
        <button className="pomodoro-btn reset" onClick={resetTimer}>
          ↺
        </button>
      </div>
    </div>
  );
}
