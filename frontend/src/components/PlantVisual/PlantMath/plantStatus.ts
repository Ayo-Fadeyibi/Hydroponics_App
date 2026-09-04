import { calcHealthScore } from "./healthCalculator"
import type { SensorReadings } from "../../../types";

/**
 * Derives the plant's health status string from sensor readings.
 *
 * Delegates to {@link calcHealthScore} and maps the result to a
 * `HealthStatus` label:
 * - `≥ 80` → `"healthy"`
 * - `≥ 50` → `"stressed"`
 * - `< 50` → `"unhealthy"`
 *
 * @param current - Live sensor readings from the user's setup.
 * @param optimal - Target optimal readings from the optimisation model.
 * @returns `"healthy"` | `"stressed"` | `"unhealthy"`
 */
const plantStatus = (current:SensorReadings, optimal:SensorReadings) => {
  const healthScore = calcHealthScore(current, optimal);

    if (healthScore >= 80) {    
        return "healthy";
    } else if (healthScore >= 50) {
        return "stressed";
    } else {
        return "unhealthy";
    }
}

export default plantStatus