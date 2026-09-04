import { motion, AnimatePresence } from "framer-motion";
import type { GrowthStage, HealthStatus } from "../../../types";

/**
 * SVG animation of a tomato plant rendered on a dark background.
 *
 * Each `stage` reveals progressively more of the plant:
 * - **seedling** — seed only
 * - **sprout** — stem at 30 % height
 * - **small** — lower leaves appear
 * - **medium** — upper leaves + circular bud
 * - **mature** — full stem, all leaves, four tomatoes with calyx and highlight
 *
 * The `health` prop controls stem/leaf/fruit colours and animation style:
 * - **healthy** — vivid greens/reds; leaves spring in; plant sways gently
 * - **stressed** — amber tones, slower sway
 * - **unhealthy** — dark brown palette; leaves fall in a looping animation;
 *   tomatoes rendered in a deep maroon
 *
 * @param stage  - Current growth stage driven by {@link PlantCarousel}.
 * @param health - Plant health status derived from the user's health score.
 */
interface Props {
  stage: GrowthStage;
  health: HealthStatus;
}

/**
 * Per-stage visibility and stem-height config.
 * `stemHeight` is a 0–1 fraction passed to Framer Motion's `pathLength`
 * so the stem draws itself to the correct length for each stage.
 */
const stageConfig: Record<GrowthStage, {
  stemHeight: number;
  showLowerLeaves: boolean;
  showUpperLeaves: boolean;
  showBud: boolean;
  showTomatoes: boolean;
}> = {
  seedling:   { stemHeight: 0,    showLowerLeaves: false, showUpperLeaves: false, showBud: false, showTomatoes: false },
  sprout: { stemHeight: 0.3,  showLowerLeaves: false, showUpperLeaves: false, showBud: false, showTomatoes: false },
  small:  { stemHeight: 0.55, showLowerLeaves: true,  showUpperLeaves: false, showBud: false, showTomatoes: false },
  medium: { stemHeight: 0.78, showLowerLeaves: true,  showUpperLeaves: true,  showBud: true,  showTomatoes: false },
  mature: { stemHeight: 1,    showLowerLeaves: true,  showUpperLeaves: true,  showBud: false, showTomatoes: true  },
};

/** SVG fill colours for stem, leaves, and bud keyed by health status. */
const healthColors: Record<HealthStatus, { stem: string; leaf: string; bud: string }> = {
  healthy:  { stem: "#4ADE80", leaf: "#22C55E", bud: "#FACC15" },
  stressed: { stem: "#D4A017", leaf: "#A67C00", bud: "#F97316" },
  unhealthy: { stem: "#7A5C3A", leaf: "#5C3D1E", bud: "#EF4444" },
};

/** Centre position, radius, and entrance delay (seconds) for each tomato fruit. */
const tomatoData = [
  { cx: 38, cy: 52, r: 5,   delay: 2.0 },
  { cx: 58, cy: 44, r: 6,   delay: 2.2 },
  { cx: 44, cy: 34, r: 4.5, delay: 2.4 },
  { cx: 62, cy: 58, r: 5,   delay: 2.6 },
];

/**
 * SVG path definitions for the four leaves (lower-left, lower-right,
 * upper-left, upper-right). `ox`/`oy` are transform-origin points
 * used by Framer Motion for scale/rotate animations.
 */
const leavesData = [
  { key: "ll", d: "M50 75 Q 28 65 22 80 Q 33 90 50 75", ox: "50px", oy: "75px", idx: 0 },
  { key: "lr", d: "M50 60 Q 72 50 78 65 Q 67 75 50 60", ox: "50px", oy: "60px", idx: 1 },
  { key: "ul", d: "M50 45 Q 30 35 26 48 Q 36 56 50 45", ox: "50px", oy: "45px", idx: 2 },
  { key: "ur", d: "M50 35 Q 68 24 74 37 Q 64 46 50 35", ox: "50px", oy: "35px", idx: 3 },
];

/** Framer Motion variants for healthy leaf growth — springs in with a staggered delay per leaf index. */
const growVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: 0.8 + i * 0.4,
      type: "spring" as const,
      stiffness: 240,
      damping: 18,
    },
  }),
  exit: { scale: 0, opacity: 0, transition: { duration: 0.3 } },
};

/** Framer Motion variants for unhealthy leaf fall — leaves drop and rotate in a looping animation. */
const fallVariants = {
  visible: { opacity: 1, y: 0, rotate: 0, x: 0 },
  fall: (i: number) => ({
    opacity: 0,
    y: 35 + i * 6,
    rotate: i % 2 === 0 ? 55 : -55,
    x: i % 2 === 0 ? 10 : -10,
    transition: {
      delay: i * 0.25,
      duration: 1.2,
      ease: "easeIn" as const,
      repeat: Infinity,
      repeatDelay: 1.8 + i * 0.4,
    },
  }),
};

const TomatoAnimation = ({ stage, health }: Props) => {
  const config = stageConfig[stage];
  const colors = healthColors[health];
  const isUnhealthy = health === "unhealthy";

  const tomatoColor = isUnhealthy ? "#6B1A00" : health === "stressed" ? "#CC4400" : "#EF4444";

  return (
    <div className="flex items-center justify-center h-100 sm:h-70 lg:h-110 w-80 sm:w-50 lg:w-90 bg-[#1a1a1a] rounded-xl overflow-hidden">
      <svg
        viewBox="0 0 100 120"
        className="w-40 h-48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soil */}
        <rect x="25" y="100" width="50" height="8" rx="4" fill="#3B2A1A" />
        <rect x="30" y="103" width="40" height="3" rx="2" fill="#2A1A0A" opacity="0.5" />

        {/* Seed */}
        <AnimatePresence>
          {stage === "seedling" && (
            <motion.ellipse
              key="seed"
              cx="50" cy="97" rx="6" ry="4"
              fill="#A0522D"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        {/* Whole plant sways from base */}
        <motion.g
          animate={{ rotate: isUnhealthy ? [-0.4, 0.4, -0.4] : [-1.5, 1.5, -1.5] }}
          transition={{ duration: isUnhealthy ? 4 : 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "50px", originY: "100px" }}
        >
          {/* Stem */}
          <AnimatePresence>
            {stage !== "seedling" && (
              <motion.path
                key={`stem-${stage}`}
                d="M50 100 C 50 100, 46 72, 50 20"
                stroke={colors.stem}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: config.stemHeight, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          {/* Leaves */}
          {leavesData.map((leaf) => {
            const isLower = leaf.idx < 2;
            const shouldShow = isLower ? config.showLowerLeaves : config.showUpperLeaves;
            const falling = isUnhealthy;

            return (
              <AnimatePresence key={leaf.key}>
                {shouldShow && (
                  <motion.path
                    key={`${leaf.key}-${health}`}
                    d={leaf.d}
                    fill={colors.leaf}
                    style={{ originX: leaf.ox, originY: leaf.oy }}
                    custom={leaf.idx}
                    variants={falling ? fallVariants : growVariants}
                    initial={falling ? "visible" : "hidden"}
                    animate={falling ? "fall" : "visible"}
                    exit="exit"
                  />
                )}
              </AnimatePresence>
            );
          })}

          {/* Bud */}
          <AnimatePresence>
            {config.showBud && (
              <motion.circle
                key="bud"
                cx="50" cy="20" r="4"
                fill={colors.bud}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 1.8, type: "spring", stiffness: 260, damping: 20 }}
              />
            )}
          </AnimatePresence>

          {/* Tomatoes */}
          <AnimatePresence>
            {config.showTomatoes && tomatoData.map((t, i) => (
              <motion.g
                key={`tomato-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: t.delay, type: "spring", stiffness: 220, damping: 16 }}
                style={{ originX: `${t.cx}px`, originY: `${t.cy}px` }}
              >
                {/* stem nub */}
                <line
                  x1={t.cx} y1={t.cy - t.r}
                  x2={t.cx} y2={t.cy - t.r - 3}
                  stroke="#22C55E"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* calyx */}
                {[-1.5, 0, 1.5].map((offset, j) => (
                  <path
                    key={j}
                    d={`M${t.cx} ${t.cy - t.r} Q${t.cx + offset * 2.5} ${t.cy - t.r - 4} ${t.cx + offset * 1.5} ${t.cy - t.r - 1.5}`}
                    stroke="#22C55E"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                ))}
                {/* body */}
                <circle cx={t.cx} cy={t.cy} r={t.r} fill={tomatoColor} />
                {/* highlight */}
                <circle
                  cx={t.cx - t.r * 0.3}
                  cy={t.cy - t.r * 0.32}
                  r={t.r * 0.28}
                  fill="white"
                  opacity={isUnhealthy ? 0.15 : 0.35}
                />
              </motion.g>
            ))}
          </AnimatePresence>
        </motion.g>
      </svg>
    </div>
  );
};

export default TomatoAnimation;