import type { components } from "../types/api";

type SensorDataRequest =
  | components["schemas"]["LettuceSensorDataRequest"]
  | components["schemas"]["TomatoSensorDataRequest"]
  | components["schemas"]["CucumberSensorDataRequest"];

export type PredictionData = components["schemas"]["PredictionData"];
export type OptimisationData = components["schemas"]["OptimisationData"];
export type ConstrainedSensorData =
  components["schemas"]["ConstrainedSensorData"];
export type LettuceGraphResponse =
  components["schemas"]["LettuceGraphResponse"];
export type ComparisonGraphResponse =
  components["schemas"]["ComparisonGraphResponse"];
export type GraphResponse = LettuceGraphResponse | ComparisonGraphResponse;

export interface LLMAdvice {
  status: string;
  advice_summary: string;
  action_steps: string[];
  priority_score: number;
}

const BASE_URL = "http://localhost:8000";

export async function predictYield(
  cropType: string,
  sensorData: SensorDataRequest,
): Promise<PredictionData> {
  const res = await fetch(`${BASE_URL}/simulate/predict/${cropType}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sensorData),
  });
  if (!res.ok) throw new Error(`Prediction failed: ${res.status}`);
  return res.json();
}

export async function optimiseEnvironment(
  cropType: string,
  constraints: ConstrainedSensorData,
): Promise<OptimisationData> {
  const res = await fetch(`${BASE_URL}/simulate/optimise/${cropType}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(constraints),
  });
  if (!res.ok) throw new Error(`Optimisation failed: ${res.status}`);
  return res.json();
}

export async function getGraph(
  cropType: string,
  sensorData: Record<string, number | string>,
  constraints: ConstrainedSensorData,
): Promise<GraphResponse> {
  const res = await fetch(`${BASE_URL}/simulate/graph/${cropType}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sensor_data: sensorData,
      constrained_sensor_data: constraints,
    }),
  });
  if (!res.ok) throw new Error(`Graph failed: ${res.status}`);
  return res.json();
}

export async function getLLMGuidance(
  cropType: string,
  sensorData: Record<string, number | string>,
  constrainedSensorData: Record<string, number>,
  optimalEnvironment?: Record<string, number>,
): Promise<LLMAdvice> {
  const res = await fetch(`${BASE_URL}/simulate/llm/${cropType}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sensor_data: sensorData,
      constrained_sensor_data: constrainedSensorData,
      optimal_environment: optimalEnvironment,
    }),
  });
  if (!res.ok) throw new Error(`LLM guidance failed: ${res.status}`);
  return res.json();
}
