import { useState, useEffect } from "react";

export function useWaterTracker(totalCups = 5) {
  const [cupsDrank, setCupsDrank] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("cupsDrank");
    if (saved) setCupsDrank(parseInt(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cupsDrank", cupsDrank);
  }, [cupsDrank]);

  const drinkCup = (index) => {
    setCupsDrank((prev) => (index + 1 === prev ? index : index + 1));
  };

  const resetCups = () => setCupsDrank(0);

  return {
    totalCups,
    cupsDrank,
    drinkCup,
    resetCups,
  };
}
