import type { components } from "./api";

/** ---------------------------- Types for /data endpoints ----------------------------*/

// Response Type for POST endpoint /data/results
export type GraphResults = components["schemas"]["GraphResults"];

// Response Type for POST endpoint /data/llm
export type UserDataAdvice = components["schemas"]["UserDataAdvice"];
