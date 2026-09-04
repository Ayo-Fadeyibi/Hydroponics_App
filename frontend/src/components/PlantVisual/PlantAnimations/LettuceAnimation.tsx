import { motion, AnimatePresence } from "framer-motion";

/**
 * SVG animation of a lettuce plant rendered on a dark background.
 *
 * Each `stage` scales the plant and adds more leaves:
 * - **seedling** — seed dot only
 * - **sprout** — 2 leaves at 40 % scale
 * - **small** — 4 leaves at 70 % scale
 * - **medium** — 5 leaves at 90 % scale
 * - **mature** — all 6 leaves at full scale
 *
 * The `health` prop controls leaf colour and whether leaves wilt:
 * - **healthy** — bright green; leaves spring into place
 * - **stressed/unhealthy** — muted or brown; leaves rotate and drift downward
 *   in a looping wilt animation
 *
 * @param stage  - Current growth stage driven by {@link PlantCarousel}.
 * @param health - Plant health status derived from the user's health score.
 */
interface Props {
  stage: "seedling" | "sprout" | "small" | "medium" | "mature";
  health: "healthy" | "stressed" | "unhealthy";
}

/**
 * Per-stage scale factor and number of visible leaves.
 * The whole `<g>` element is scaled from the soil origin so the plant
 * appears to grow upward as the stage advances.
 */
const stageConfig = {
  seedling: { scale: 0.2, leaves: 0 },
  sprout:   { scale: 0.4, leaves: 2 },
  small:    { scale: 0.7, leaves: 4 },
  medium:   { scale: 0.9, leaves: 5 },
  mature:   { scale: 1,   leaves: 6 },
};

/** Leaf fill colour keyed by health status. */
const healthColors = {
  healthy:   "#22C55E",
  stressed:  "#A3A300",
  unhealthy: "#5A3E1B",
};

/** SVG cubic Bézier paths for each of the six lettuce leaf shapes, alternating left/right. */
const leafShapes = [
  "M50 50 C40 30, 20 30, 30 55 C35 65, 45 60, 50 50",
  "M50 50 C60 30, 80 30, 70 55 C65 65, 55 60, 50 50",
  "M50 50 C35 40, 25 20, 40 30 C45 40, 50 50",
  "M50 50 C65 40, 75 20, 60 30 C55 40, 50 50",
  "M50 50 C30 50, 20 40, 35 60 C45 70, 50 50",
  "M50 50 C70 50, 80 40, 65 60 C55 70, 50 50",
];

/** Framer Motion variants for healthy leaf growth — springs in with a staggered delay per leaf index. */
const growVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.2,
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
    },
  }),
  exit: { scale: 0, opacity: 0 },
};

/** Framer Motion variants for unhealthy/stressed wilting — leaves rotate and drift downward in a mirror loop. */
const wiltVariants = {
  healthy: { rotate: 0, y: 0, opacity: 1 },
  wilt: (i: number) => ({
    rotate: i % 2 === 0 ? 15 : -15,
    y: 10 + i * 2,
    opacity: 0.7,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "mirror" as const,
    },
  }),
};

const LettuceAnimation = ({ stage, health }: Props) => {
  const config = stageConfig[stage];
  const color = healthColors[health];
  const isUnhealthy = health !== "healthy";

  return (
    <div className="flex items-center justify-center h-100 sm:h-70 lg:h-110 w-80 sm:w-50 lg:w-90 bg-[#1a1a1a] rounded-xl overflow-hidden">
      <svg viewBox="0 0 100 100" className="w-44 h-44">

        {/* Soil */}
        <rect x="20" y="80" width="60" height="10" rx="5" fill="#3B2A1A" />

        {/* Seed */}
        <AnimatePresence>
          {stage === "seedling" && (
            <motion.circle
              key="seed"
              cx="50" cy="78" r="4"
              fill="#8B5A2B"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        {/* Leaves */}
        <motion.g
          animate={{ scale: config.scale }}
          style={{ originX: "50px", originY: "80px" }}
        >
          {leafShapes.slice(0, config.leaves).map((d, i) => (
            <motion.path
              key={`leaf-${i}-${health}`}
              d={d}
              fill={color}
              custom={i}
              variants={isUnhealthy ? wiltVariants : growVariants}
              initial={isUnhealthy ? "healthy" : "hidden"}
              animate={isUnhealthy ? "wilt" : "visible"}
              exit="exit"
            />
          ))}
        </motion.g>

      </svg>
    </div>
  );
};

export default LettuceAnimation;