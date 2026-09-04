import type { SensorReadings } from "../../../types";

/**
 * Returns a per-sensor health score (0–100) for each reading.
 *
 * Score is calculated as `max(0, 100 - (|current - optimal| / optimal) * 100)`.
 * A score of 100 means the sensor is exactly at its optimal value;
 * 0 means it has deviated by 100 % or more of the optimal value.
 *
 * @param current - Live sensor readings from the user's setup.
 * @param optimal - Target optimal readings from the optimisation model.
 * @returns Map of sensor key → score (0–100).
 */
export function calcSensorScores(
  current: SensorReadings,
  optimal: SensorReadings
): Record<keyof SensorReadings, number> {
  const keys = Object.keys(optimal) as (keyof SensorReadings)[];
  return keys.reduce((acc, key) => {
    const tol = Math.abs(current[key] - optimal[key]);
    acc[key] = Math.max(0, 100 - (tol / optimal[key]) * 100);
    return acc;
  }, {} as Record<keyof SensorReadings, number>);
}

/**
 * Returns a single averaged health score (0–100) across all sensors.
 *
 * Averages the individual scores from {@link calcSensorScores} and rounds
 * the result to the nearest integer.
 *
 * @param current - Live sensor readings from the user's setup.
 * @param optimal - Target optimal readings from the optimisation model.
 * @returns Overall health score (0–100).
 */
export function calcHealthScore(
  current: SensorReadings,
  optimal: SensorReadings
): number {
  const scores = Object.values(calcSensorScores(current, optimal));
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}