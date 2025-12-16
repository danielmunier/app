import "./WaterTracker.css";
import { useWaterContext } from "../../context/WaterProvider";

export default function WaterTracker() {
  const { addDrink, resetDrinks, GLASS_ML, percent, goalReached, waterStreak } = useWaterContext();

  // Horário atual formatado
  const now = new Date();
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`water-card ${goalReached ? "completed" : ""}`}>
      <div className="water-card-time">{timeStr}</div>
      <div className="water-card-text">Copo de {GLASS_ML}ml</div>

      {/* Copo animado */}
      <div className="water-glass">
        <div className="glass-body">
          <div className="water-fill" style={{ height: `${percent}%` }}>
            <div className="water-wave" />
          </div>
        </div>
      </div>

      {/* Streak badge */}
      {waterStreak > 0 && (
        <div className="water-streak-badge">
          💧 {waterStreak} {waterStreak === 1 ? "dia" : "dias"}
        </div>
      )}

      <button
        className="water-add-btn"
        onClick={addDrink}
        disabled={goalReached}
      >
        {goalReached ? "Meta batida! 🎉" : "Beber agora"}
      </button>

      <button className="water-reset-btn" onClick={resetDrinks}>
        Limpar
      </button>
    </div>
  );
}
