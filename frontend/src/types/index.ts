import type { components } from "./api";

/** ---------------------- Types for Predict & Optimise Endpoints ------------------------*/

/** Types for Request Data that will be sent via sliders to the BE (POST REQUEST) */
export type LettuceSensorData =
  components["schemas"]["LettuceSensorDataRequest"];

export type TomatoSensorData = components["schemas"]["TomatoSensorDataRequest"];

export type CucumberSensorData =
  components["schemas"]["CucumberSensorDataRequest"];

export type ConstrainedSensorData =
  components["schemas"]["ConstrainedSensorData"];

/** ---------------------------- Types for LLM Endpoint ----------------------------*/

// LLMRequest Request Data
export type LLMRequest = components["schemas"]["LLMRequest"];

// Hydroponic Advice Response
export type HydroponicAdvice = components["schemas"]["HydroponicAdvice"];

/** ---------------Types for Graph Response Data - will be returned by graph endpoint --------------*/
export type LettuceGraphResponse =
  components["schemas"]["LettuceGraphResponse"];

// returned graphs for cucumber and tomato
export type ComparisonGraphResponse =
  components["schemas"]["ComparisonGraphResponse"];

export type GrowthStage = "seedling" | "sprout" | "small" | "medium" | "mature";
export type HealthStatus = "healthy" | "stressed" | "unhealthy";

export interface SensorReadings {
  Avg_pH: number;
  Avg_EC: number;
  Avg_CO2: number;
  Avg_RH: number;
  Avg_Air_Temp: number;
  Avg_Water_Temp: number;
  Avg_TDS: number;
}
