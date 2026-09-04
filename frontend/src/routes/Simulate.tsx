import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SimulateHeader from "../components/simulate/SimulateHeader";
import EnvSliders, {
  initialSensorsForCrop,
} from "../components/VariableSliders/EnvSliders";
import PlantCarousel from "../components/PlantVisual/PlantCarousel";
import type { SensorConfig } from "../components/VariableSliders/SensorRow";
import { GrowthChart } from "../components/Chart/Growthchart";
import { Leaf, LineChart, Sparkles, Download } from "lucide-react";
import OptimisationReport from "../components/Ai/Report";
import { exportSimulationPDF } from "../utils/exportPDF";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import {
  predictYield,
  optimiseEnvironment,
  getLLMGuidance,
  getGraph,
} from "../services/api";
import type {
  PredictionData,
  OptimisationData,
  ConstrainedSensorData,
  LLMAdvice,
  GraphResponse,
} from "../services/api";

type View = "plant" | "chart" | "report";

/**
 * Main simulation page rendered at `/simulate/:crop`.
 *
 * Orchestrates the full simulation flow:
 * 1. User adjusts sensor sliders and optionally locks constraints.
 * 2. Clicking "Simulate Growth" fires three parallel API calls:
 *    - `/predict/:crop` → predicted harvest weight for current conditions
 *    - `/optimise/:crop` → optimal environment given locked constraints + optimal yield
 *    - `/graph/:crop`   → growth curve coordinates for the chart
 * 3. Results are stored in state; optimal targets are written back to slider
 *    `target` fields. A committed snapshot of sensor values is saved separately
 *    so {@link ConditionCheck} is not affected by subsequent slider moves.
 * 4. An LLM call to `/llm/:crop` runs in the background and populates the
 *    Optimisation Report tab once resolved.
 *
 * Health scores are computed as `(harvest_weight / global_optimal_yield) * 99`,
 * where `global_optimal_yield` is a pre-computed constant per crop.
 *
 * A driver.js onboarding tour runs once on first visit (guarded by
 * `localStorage["simlab-tour-seen"]`).
 */
export default function Simulate() {
  const { crop: rawCrop = "lettuce" } = useParams<{ crop: string }>();
  const crop = rawCrop.toLowerCase();

  const [sensors, setSensors] = useState<SensorConfig[]>(() =>
    initialSensorsForCrop(crop),
  );
  const [committedSensors, setCommittedSensors] = useState<SensorConfig[]>(() =>
    initialSensorsForCrop(crop),
  );
  const [simulated, setSimulated] = useState(false);
  const [view, setView] = useState<View>("plant");
  const [growthAnimationDone, setGrowthAnimationDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(
    null,
  );
  const [optimisationData, setOptimisationData] =
    useState<OptimisationData | null>(null);
  const [llmAdvice, setLlmAdvice] = useState<LLMAdvice | null>(null);
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const allPresent = [
        "#env-sliders",
        "#plant-carousel",
        "#view-toggle",
        "#export-pdf",
      ].every((id) => document.querySelector(id));
      if (!allPresent) return;

      const tour = driver({
        showProgress: true,
        allowClose: true,
        showButtons: ["next", "close"],
        steps: [
          {
            element: "#env-sliders",
            popover: {
              title: "Environmental Controls",
              description:
                "Adjust these sliders to match your current hydroponic setup.",
              side: "right",
            },
          },
          {
            element: "#plant-carousel",
            popover: {
              title: "Plant Growth Stages",
              description:
                "Use the tabs to preview each growth stage of your plant.",
              side: "left",
            },
          },
          {
            element: "#view-toggle",
            popover: {
              title: "Switch Views",
              description:
                "Toggle between the plant visual and the growth chart.",
              side: "bottom",
            },
          },
          {
            element: "#export-pdf",
            popover: {
              title: "Export PDF Report",
              description:
                "After running a simulation, download a full PDF report with your health scores, yield comparison, environment settings, and AI advice.",
              side: "top",
            },
          },
        ],
      });
      tour.drive();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      const sensorPayload = Object.fromEntries(
        sensors.map((s) => [s.key, s.value]),
      );
      const constraints = Object.fromEntries(
        sensors.filter((s) => s.locked).map((s) => [s.key, s.value]),
      ) as ConstrainedSensorData;

      const [prediction, optimisation, graph] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        predictYield(crop, { ...sensorPayload, crop } as any),
        optimiseEnvironment(crop, constraints),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getGraph(crop, { ...sensorPayload, crop } as any, constraints),
      ]);

      setPredictionData(prediction);
      setOptimisationData(optimisation);
      setGraphData(graph);

      const optimal = optimisation.optimal_environment as Record<
        string,
        number
      >;
      const sensorsWithTargets = sensors.map((s) =>
        s.key in optimal
          ? { ...s, target: Math.round(optimal[s.key] * 10) / 10 }
          : s,
      );
      setSensors(sensorsWithTargets);
      setCommittedSensors(sensorsWithTargets);
      setSimulated(true);

      // Call LLM in background — doesn't block showing results
      setLlmAdvice(null);
      setIsLoadingLLM(true);
      getLLMGuidance(
        crop,
        { ...sensorPayload, crop },
        constraints as Record<string, number>,
        optimisation.optimal_environment as Record<string, number>,
      )
        .then(setLlmAdvice)
        .catch((err) => console.error("LLM guidance failed:", err))
        .finally(() => setIsLoadingLLM(false));
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const OPTIMAL_HEALTH_SCORE = 99; // calculate global optimal
  // optimal yield per crop given all optimal conditions
  const optimisedCropYield: Record<string, number> = {
    lettuce: 380.3893534278201,
    cucumber: 398.74611383828,
    tomato: 3246.541739711287,
  };

  const userHealthScore = (() => {
    const harvestWeight = predictionData?.harvest_weight;
    const optimalYield = optimisedCropYield[crop];
    if (harvestWeight == null || optimalYield == null || optimalYield === 0)
      return undefined;
    const result = Math.round(
      (harvestWeight / optimalYield) * OPTIMAL_HEALTH_SCORE,
    );
    return Number.isFinite(result)
      ? Math.min(OPTIMAL_HEALTH_SCORE, Math.max(0, result))
      : 0;
  })();

  const optimalHealthScore = (() => {
    // If no locked constraints then return constant score
    if (!committedSensors.some((s) => s.locked)) return OPTIMAL_HEALTH_SCORE;
    const optimalLockedYield = optimisationData?.optimal_yield;
    const optimalGlobalYield = optimisedCropYield[crop];
    if (optimalLockedYield == null || optimalGlobalYield == null)
      return undefined;
    const lockedResult = Math.round(
      (optimalLockedYield / optimalGlobalYield) * OPTIMAL_HEALTH_SCORE,
    );
    return Number.isFinite(lockedResult) ? lockedResult : OPTIMAL_HEALTH_SCORE;
  })();

  const cropIcons: Record<string, string> = {
    lettuce: "🥬",
    cucumber: "🥒",
    tomato: "🍅",
  };
  const cropDays: Record<string, number> = {
    lettuce: 35,
    cucumber: 55,
    tomato: 70,
  };
  const cropIcon = cropIcons[crop] ?? "🌱";
  const daysToHarvest = cropDays[crop] ?? 60;

  return (
    <div className="min-h-screen bg-[#f4f9f4] font-sans overflow-x-hidden">
      <div className="px-20 py-6">
        <SimulateHeader />
      </div>
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-4 px-20 pb-6">
        <div id="env-sliders" className="flex w-full lg:w-[28%]">
          <EnvSliders
            sensors={sensors}
            onChange={setSensors}
            onSimulate={handleSimulate}
            onApplyOptimal={() => setGrowthAnimationDone(false)}
            isLoading={isLoading}
            optimalValues={
              optimisationData?.optimal_environment as
                | Record<string, number>
                | undefined
            }
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Toggle buttons */}
          <div
            id="view-toggle"
            className="flex gap-2 bg-white border border-gray-100 shadow-sm p-1 rounded-xl w-fit"
          >
            <button
              onClick={() => setView("plant")}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer
                ${
                  view === "plant"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Leaf size={13} />
              Plant View
            </button>
            {simulated && (
              <button
                onClick={() => setView("chart")}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer
                    ${
                      view === "chart"
                        ? "bg-green-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
              >
                <LineChart size={13} />
                Growth Chart
              </button>
            )}
            {simulated && (
              <button
                id="optimise"
                onClick={() => setView("report")}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer
                  ${
                    view === "report"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Sparkles size={13} />
                Optimisation Report
              </button>
            )}
          </div>

          {/* Content */}
          {/* PlantCarousel stays mounted to preserve stage state across tab switches */}
          <div id="plant-carousel" className={view !== "plant" ? "hidden" : ""}>
            <PlantCarousel
              simulated={simulated}
              sensors={committedSensors}
              growthAnimationDone={growthAnimationDone}
              onAnimationDone={() => setGrowthAnimationDone(true)}
              userHealthScore={
                simulated
                  ? Math.min(userHealthScore ?? 0, optimalHealthScore ?? 0)
                  : undefined
              }
              optimalHealthScore={simulated ? optimalHealthScore : undefined}
            />
            <div id="export-pdf" className="mt-3">
              <button
                disabled={!simulated || !predictionData || !optimisationData}
                onClick={() =>
                  predictionData && optimisationData &&
                  exportSimulationPDF({
                    crop,
                    sensors: committedSensors,
                    predictionYield: predictionData.harvest_weight,
                    optimisationData,
                    userHealthScore: userHealthScore ?? 0,
                    optimalHealthScore: optimalHealthScore ?? 99,
                    llmAdvice,
                  })
                }
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${simulated && predictionData && optimisationData
                    ? "bg-white border border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700 cursor-pointer shadow-sm"
                    : "bg-white border border-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
              >
                <Download size={14} />
                Export PDF Report
              </button>
            </div>
          </div>

          {simulated && view === "chart" && (
            <GrowthChart
              graphData={graphData}
              baselineYield={predictionData?.harvest_weight ?? 100}
              optimisedYield={optimisationData?.optimal_yield ?? 110}
              cropIcon={cropIcon}
              daysToHarvest={daysToHarvest}
            />
          )}

          {simulated && view === "report" && optimisationData && (
            <OptimisationReport
              cropName={crop}
              optimisationData={optimisationData}
              currentYield={predictionData?.harvest_weight}
              llmAdvice={llmAdvice}
              isLoadingLLM={isLoadingLLM}
            />
          )}
        </div>
      </div>
    </div>
  );
}
