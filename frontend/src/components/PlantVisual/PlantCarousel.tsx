import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import type { GrowthStage, HealthStatus } from "../../types";
import { useLocation } from "react-router-dom";
import TomatoAnimation from "./PlantAnimations/TomatoAnimation";
import CucumberAnimation from "./PlantAnimations/CucumberAnimation";
import LettuceAnimation from "./PlantAnimations/LettuceAnimation";
import ConditionCheck from "./ConditionCheck";
import type { SensorConfig } from "../VariableSliders/SensorRow";

/** Ordered list of growth stages used to drive the auto-advance animation. */
const stages: GrowthStage[] = ["seedling", "sprout", "small", "medium", "mature"];

/**
 * Framer Motion slide variants for the plant carousel.
 * Positive `dir` slides new content in from the right; negative from the left.
 */
const carouselVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
};

/**
 * Maps a health score to a label, percentage range string, and Tailwind colour classes.
 *
 * @param score - Health score (0–100).
 * @returns Object with `label`, `range`, `bg`, `text`, `border`, and `labelText` classes.
 */
function getHealthBand(score: number): { label: string; range: string; bg: string; text: string; border: string; labelText: string } {
  if (score < 20)  return { label: "Critical",  range: "0–20%",   bg: "bg-red-100",    text: "text-red-600",    border: "border-red-200",    labelText: "text-red-800"    };
  if (score < 40)  return { label: "Poor",      range: "20–40%",  bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200", labelText: "text-orange-800" };
  if (score < 60)  return { label: "Moderate",  range: "40–60%",  bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", labelText: "text-yellow-900" };
  if (score < 80)  return { label: "Good",      range: "60–80%",  bg: "bg-lime-100",   text: "text-lime-700",   border: "border-lime-200",   labelText: "text-lime-800"   };
  return             { label: "Optimal",   range: "80–100%", bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200",  labelText: "text-green-800"  };
}

/**
 * Returns a short human-readable comment about plant health for display below the score.
 *
 * @param score - Health score (0–100).
 */
function getHealthComment(score: number): string {
  if (score < 20) return "Plant unlikely to survive these conditions.";
  if (score < 40) return "Severely stunted growth expected.";
  if (score < 60) return "Partial yield expected with current conditions.";
  if (score < 80) return "Healthy conditions — close to optimal.";
  return "Near-perfect conditions for maximum yield.";
}

/**
 * Converts a numeric health score to a {@link HealthStatus} string
 * used to select the correct plant animation variant.
 *
 * @param score - Health score (0–100).
 * @returns `"healthy"` (≥70) | `"stressed"` (≥40) | `"unhealthy"` (<40)
 */
function scoreToStatus(score: number): HealthStatus {
  if (score >= 70) return "healthy";
  if (score >= 40) return "stressed";
  return "unhealthy";
}

/**
 * Side-by-side plant visualisation with health scoring.
 *
 * Shows "Your Setup" and "AI Best Achievable" panels. When `simulated`
 * becomes true the carousel auto-advances through the five growth stages
 * (seedling → sprout → small → medium → mature) using staggered timeouts:
 * the seedling exits quickly (200 ms) while later stages pause long enough
 * (1 800–2 800 ms) for their Framer Motion slide animations to complete.
 *
 * The component stays mounted across tab switches (hidden via CSS) so the
 * reached stage is preserved when the user returns to Plant View.
 *
 * A {@link ConditionCheck} summary is shown below the panels once simulated,
 * using the sensor snapshot from when simulate was last clicked.
 *
 * @param simulated           - Whether a simulation has been run.
 * @param sensors             - Committed sensor values (snapshot at simulate time).
 * @param growthAnimationDone - Prevents re-running the stage animation on re-render.
 * @param onAnimationDone     - Called once when the auto-advance sequence starts.
 * @param userHealthScore     - 0–100 score derived from harvest_weight / optimal_yield.
 * @param optimalHealthScore  - Ceiling score (99, or lower when constraints are locked).
 */
interface Props {
  simulated: boolean;
  sensors: SensorConfig[];
  growthAnimationDone?: boolean;
  onAnimationDone: () => void;
  userHealthScore?: number;   // 0-100, computed from sensors
  optimalHealthScore?: number; // almost always ~99
}

export default function PlantCarousel({
  simulated,
  sensors,
  growthAnimationDone,
  onAnimationDone,
  userHealthScore = 55,
  optimalHealthScore = 99,
}: Props) {
  const [stage, setStage] = useState<GrowthStage>("seedling");
  const [direction, setDirection] = useState(1);
  const location = useLocation();
  const path = location.pathname;

  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-advance when simulated becomes true
  useEffect(() => {
    if (!simulated) return;
    if (growthAnimationDone) return;

    onAnimationDone();

    setIsAnimating(true);
    setDirection(1);

    const startIndex = stages.indexOf(stage);
    // seedling exits fast; each subsequent stage waits long enough for its animation to finish
    const stageDelays = [200, 1800, 2400, 2800];
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    stageDelays.forEach((delay, i) => {
      cumulative += delay;
      const t = setTimeout(() => {
        const nextIndex = startIndex + i + 1;
        if (nextIndex < stages.length) setStage(stages[nextIndex]);
        if (i === stageDelays.length - 1) setIsAnimating(false);
      }, cumulative);
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulated]);


  const safeUser    = Number.isFinite(userHealthScore)    ? userHealthScore    : 55;
  const safeOptimal = Number.isFinite(optimalHealthScore) ? optimalHealthScore : 99;
  const userBand    = getHealthBand(safeUser);
  const optimalBand = getHealthBand(safeOptimal);
  const userStatus  = scoreToStatus(safeUser);
  const lockedCount = sensors.filter(s => s.locked).length;
  const aiComment   = lockedCount > 0
    ? `Best achievable given your ${lockedCount} locked constraint${lockedCount !== 1 ? "s" : ""}.`
    : "Unconstrained AI-optimal configuration.";

  function PlantFor(health: HealthStatus) {
    if (path.includes("Cucumber")) return <CucumberAnimation stage={stage} health={health} />;
    if (path.includes("Tomato"))   return <TomatoAnimation   stage={stage} health={health} />;
    return                                <LettuceAnimation  stage={stage} health={health} />;
  }

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-4 min-h-250 p-6">
      {/* Two panels */}
      <div className="flex flex-row gap-4 w-full h-full">

        {/* Your Setup */}
        <div className={`flex-1 flex flex-col items-center gap-3 ${userBand.bg} border ${userBand.border} rounded-2xl p-4 overflow-hidden`}>
          <div className="flex items-center justify-between w-full">
            <p className={`text-xs font-semibold ${userBand.labelText} uppercase tracking-widest`}>Your Setup</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/60 ${userBand.text}`}>
              {userBand.label} {userBand.range}
            </span>
          </div>

          <div className="overflow-hidden w-full flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`user-${stage}`}
                custom={direction}
                variants={carouselVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                {PlantFor(userStatus)}
              </motion.div>
            </AnimatePresence>
          </div>

          {simulated && (
            <div className="w-full text-center">
              <p className={`text-3xl font-bold ${userBand.text}`}>{safeUser}%</p>
              <p className={`text-xs uppercase tracking-widest ${userBand.text}`}>of optimal</p>
              <hr className="my-2 border-gray-200" />
              <p className="text-xs text-gray-500">{getHealthComment(safeUser)}</p>
            </div>
          )}

        </div>

        {/* AI Best Achievable */}
        <div className="flex-1 flex flex-col items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 overflow-hidden">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs font-semibold text-green-800 uppercase tracking-widest">AI Best Achievable</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${optimalBand.bg} ${optimalBand.text}`}>
              {optimalBand.label} {optimalBand.range}
            </span>
          </div>

          <div className="overflow-hidden w-full flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`optimal-${stage}`}
                custom={direction}
                variants={carouselVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                {PlantFor("healthy")}
              </motion.div>
            </AnimatePresence>
          </div>

          {simulated && (
            <div className="w-full text-center">
              <p className="text-3xl font-bold text-green-600">{safeOptimal}%</p>
              <p className="text-xs uppercase tracking-widest text-green-600">of optimal</p>
              <hr className="my-2 border-green-200" />
              <p className="text-xs text-gray-500">{aiComment}</p>
            </div>
          )}
        </div>

      </div>

      {!simulated && (
        <>
          <div className="text-center px-8">
            <p className="text-gray-800 font-medium text-lg">Ready to simulate</p>
            <p className="text-gray-400 text-sm mt-1">
              Configure your environmental parameters and click "Simulate Growth" to see projections
            </p>
          </div>
        </>
      )}

      {simulated && <ConditionCheck sensors={sensors} />}
      {isAnimating && (
        <div>
          <p className="text-xs text-green-600 animate-pulse">
            Simulating growth...
          </p>
        </div>
      )}
    </div>
  );
}
