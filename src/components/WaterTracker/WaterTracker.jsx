import { useEffect, useState } from "react";
import { FaGlassWhiskey } from "react-icons/fa";
import "./WaterTracker.css";

export default function WaterTracker({ totalCups = 5 }) {
  const getInitialState = () => {
    try {
      const savedData = JSON.parse(localStorage.getItem("waterTracker"));
      const today = new Date().toDateString();

      if (savedData && savedData.date === today) {
        return savedData.cupsDrank;
      }
    } catch (e) {
      console.error("Erro lendo waterTracker:", e);
    }
    return 0; // fallback
  };

  const [cupsDrank, setCupsDrank] = useState(getInitialState);

  // 🔹 sincroniza sempre que muda
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(
      "waterTracker",
      JSON.stringify({ cupsDrank, date: today })
    );
  }, [cupsDrank]);

  const drinkCup = (index) => {
    // alterna entre marcar e desmarcar o último copo
    setCupsDrank((prev) => (index + 1 === prev ? index : index + 1));
  };

  const resetCups = () => setCupsDrank(0);

  return (
    <div className="water-tracker">

      <div className="water-cups">
        {Array.from({ length: totalCups }).map((_, i) => (
          <button
            key={i}
            className={`cup ${i < cupsDrank ? "filled" : ""}`}
            onClick={() => drinkCup(i)}
          >
            <FaGlassWhiskey size={28} />
          </button>
        ))}
      </div>


    </div>
  );
}
