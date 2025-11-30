/**
 * @deprecated Use useWaterContext() do WaterProvider.jsx
 * Este hook foi mantido apenas para compatibilidade.
 * O reminder agora é gerenciado por useWaterReminder.js
 */
import { useWaterContext } from "../context/WaterProvider";

export function useWater() {
  return useWaterContext();
}
