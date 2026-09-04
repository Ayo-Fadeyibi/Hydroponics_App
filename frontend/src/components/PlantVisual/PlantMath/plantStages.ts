import type { GrowthStage } from "../../../types/index.ts";

/**
 * Maps a predicted harvest weight in grams to a {@link GrowthStage}.
 *
 * Thresholds:
 * - `< 80 g`  → `"seedling"`
 * - `< 150 g` → `"sprout"`
 * - `< 220 g` → `"small"`
 * - `< 300 g` → `"medium"`
 * - `≥ 300 g` → `"mature"`
 *
 * @param predictedGrams - Harvest weight predicted by the ML model in grams.
 * @returns The corresponding growth stage label.
 */
export function getPlantStage(predictedGrams: number): GrowthStage{
    if (predictedGrams < 80) {
        return "seedling";
    }
    if (predictedGrams < 150) {
        return "sprout";
    }if (predictedGrams < 220) {
        return "small";
    }if (predictedGrams < 300) {
        return "medium";
    }
    return "mature";
}