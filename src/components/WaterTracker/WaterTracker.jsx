import "./WaterTracker.css";
import { LuGlassWater } from "react-icons/lu";
import { useWaterContext } from "../../context/WaterProvider";

export default function WaterTracker() {
  const { cups, toggleCup, percent } = useWaterContext(); 
  return (
    <div className="water-tracker">
      <div className="water-cups">
        {cups.map((filled, i) => (
          <button
            key={i}
            className={`cup-button ${filled ? "filled" : ""}`}
            onClick={() => toggleCup(i)}
          >
            <div className="cup-icon-wrapper">
              <LuGlassWater
                size={36}
                strokeWidth={2.3}
                style={{
                  color: filled ? "#00ccff" : "rgba(255,255,255,0.5)",
                  filter: filled
                    ? "drop-shadow(0 0 2px rgba(107,225,255,0.95))"
                    : "none",
                  transition: "all 0.25s ease",
                }}
              />
              {!filled && <span className="cup-badge" />}
            </div>
          </button>
        ))}
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}
