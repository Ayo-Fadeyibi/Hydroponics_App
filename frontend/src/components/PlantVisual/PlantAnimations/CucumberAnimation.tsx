import { motion, AnimatePresence } from "framer-motion";
import type { GrowthStage, HealthStatus } from "../../../types";

/**
 * SVG animation of a cucumber plant rendered on a dark background.
 *
 * Each `stage` reveals progressively more of the plant:
 * - **seedling** — seed only
 * - **sprout** — stem begins to grow (30 % height)
 * - **small** — lower leaves appear
 * - **medium** — upper leaves + flower bud
 * - **mature** — full stem, all leaves, cucumbers hanging from the vine
 *
 * The `health` prop controls stem/leaf/bud colours and animation style:
 * - **healthy** — leaves grow in with a spring; plant sways gently
 * - **stressed** — muted amber tones, slower sway
 * - **unhealthy** — dark brown palette; leaves fall in a looping animation
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
  showCucumbers: boolean;
}> = {
  seedling: { stemHeight: 0,    showLowerLeaves: false, showUpperLeaves: false, showBud: false, showCucumbers: false },
  sprout:   { stemHeight: 0.3,  showLowerLeaves: false, showUpperLeaves: false, showBud: false, showCucumbers: false },
  small:    { stemHeight: 0.55, showLowerLeaves: true,  showUpperLeaves: false, showBud: false, showCucumbers: false },
  medium:   { stemHeight: 0.78, showLowerLeaves: true,  showUpperLeaves: true,  showBud: true,  showCucumbers: false },
  mature:   { stemHeight: 1,    showLowerLeaves: true,  showUpperLeaves: true,  showBud: false, showCucumbers: true  },
};

/** SVG fill colours for stem, leaves, and bud keyed by health status. */
const healthColors: Record<HealthStatus, { stem: string; leaf: string; bud: string }> = {
  healthy:   { stem: "#4ADE80", leaf: "#22C55E", bud: "#FACC15" },
  stressed:  { stem: "#D4A017", leaf: "#A67C00", bud: "#F97316" },
  unhealthy: { stem: "#7A5C3A", leaf: "#5C3D1E", bud: "#EF4444" },
};

/**
 * SVG path definitions for the four leaves (lower-left, lower-right,
 * upper-left, upper-right). `ox`/`oy` are the transform-origin points
 * used by Framer Motion for scale/rotate animations.
 */
const leavesData = [
  { key: "ll", d: "M50 78 Q 24 66 18 82 Q 30 96 50 78", ox: "50px", oy: "78px", idx: 0 },
  { key: "lr", d: "M50 63 Q 76 51 82 67 Q 70 80 50 63", ox: "50px", oy: "63px", idx: 1 },
  { key: "ul", d: "M50 47 Q 27 34 22 50 Q 34 62 50 47", ox: "50px", oy: "47px", idx: 2 },
  { key: "ur", d: "M50 37 Q 72 24 78 40 Q 66 52 50 37", ox: "50px", oy: "37px", idx: 3 },
];

/** Attachment and end-point coordinates for each cucumber fruit, plus stagger delay (seconds). */
const cucumberData = [
  { attachX: 50, attachY: 72, endX: 26, endY: 88,  delay: 2.0 },
  { attachX: 50, attachY: 58, endX: 74, endY: 72,  delay: 2.2 },
  { attachX: 50, attachY: 44, endX: 28, endY: 56,  delay: 2.4 },
  { attachX: 50, attachY: 34, endX: 70, endY: 46,  delay: 2.6 },
];

/** Framer Motion variants for healthy leaf growth — springs in with a staggered delay per leaf index. */
const growVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1, opacity: 1,
    transition: { delay: 0.8 + i * 0.4, type: "spring" as const, stiffness: 240, damping: 18 },
  }),
  exit: { scale: 0, opacity: 0, transition: { duration: 0.3 } },
};

/** Framer Motion variants for unhealthy leaf fall — leaves drop and rotate in a looping animation. */
const fallVariants = {
  visible: { opacity: 1, y: 0, rotate: 0, x: 0 },
  fall: (i: number) => ({
    opacity: 0, y: 35 + i * 6,
    rotate: i % 2 === 0 ? 55 : -55,
    x: i % 2 === 0 ? 10 : -10,
    transition: { delay: i * 0.25, duration: 1.2, ease: "easeIn" as const, repeat: Infinity, repeatDelay: 1.8 + i * 0.4 },
  }),
};

/**
 * Props for the internal {@link Cucumber} SVG primitive.
 *
 * @property attachX/Y  - Point on the stem where the vine starts (SVG coords).
 * @property endX/Y     - Tip of the cucumber fruit (SVG coords).
 * @property body       - Fill colour of the cucumber body.
 * @property dark       - Darker shade used for the centre stripe and rounded tip.
 * @property highlight  - Opacity (0–1) of the white highlight stripe.
 */
interface CucumberProps {
  attachX: number; attachY: number;
  endX: number;    endY: number;
  body: string;    dark: string;  highlight: number;
}

/**
 * Draws a single cucumber fruit as an SVG group using vector geometry.
 *
 * Computes a unit vector from `attachX/Y` to `endX/Y`, then constructs the
 * fruit body as a quadratic Bézier outline with a slight curve, a centre
 * stripe, a rounded dark tip, a small yellow flower stub, and a highlight.
 */
function Cucumber({ attachX, attachY, endX, endY, body, dark, highlight }: CucumberProps) {
  const dx = endX - attachX;
  const dy = endY - attachY;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len; // unit vector along cucumber
  const uy = dy / len;
  const px = -uy;     // perpendicular
  const py = ux;
  const w = 2.8;      // half-width
  const tipX = attachX + ux * len;
  const tipY = attachY + uy * len;
  const midX = (attachX + tipX) / 2;
  const midY = (attachY + tipY) / 2;
  // slight curve control point
  const cx = midX + px * 2;
  const cy = midY + py * 2;

  return (
    <g>
      {/* thin vine from stem */}
      <path
        d={`M${attachX} ${attachY} L${attachX + ux * 3} ${attachY + uy * 3}`}
        stroke="#22C55E" strokeWidth="0.9" strokeLinecap="round" opacity="0.8"
      />
      {/* cucumber body — left edge */}
      <path
        d={`
          M${attachX + ux * 3 + px * w} ${attachY + uy * 3 + py * w}
          Q${cx + px * w} ${cy + py * w}
            ${tipX - ux * 2 + px * (w * 0.4)} ${tipY - uy * 2 + py * (w * 0.4)}
          Q${tipX + px * 0} ${tipY + py * 0}
            ${tipX - ux * 2 - px * (w * 0.4)} ${tipY - uy * 2 - py * (w * 0.4)}
          Q${cx - px * w} ${cy - py * w}
            ${attachX + ux * 3 - px * w} ${attachY + uy * 3 - py * w}
          Q${attachX + ux * 1} ${attachY + uy * 1}
            ${attachX + ux * 3 + px * w} ${attachY + uy * 3 + py * w}
          Z
        `}
        fill={body}
      />
      {/* centre stripe */}
      <path
        d={`M${attachX + ux * 4} ${attachY + uy * 4} Q${cx} ${cy} ${tipX - ux * 2} ${tipY - uy * 2}`}
        stroke={dark} strokeWidth="0.6" fill="none" opacity="0.5" strokeLinecap="round"
      />
      {/* rounded tip */}
      <ellipse
        cx={tipX - ux * 1.5} cy={tipY - uy * 1.5}
        rx={w * 0.9} ry={w * 0.9}
        fill={dark}
        transform={`rotate(${Math.atan2(uy, ux) * 180 / Math.PI}, ${tipX - ux * 1.5}, ${tipY - uy * 1.5})`}
      />
      {/* tiny yellow flower stub at tip */}
      <circle cx={tipX} cy={tipY} r="1.2" fill="#FBBF24" opacity="0.85" />
      {/* highlight */}
      <path
        d={`M${attachX + ux * 5 + px * (w * 0.5)} ${attachY + uy * 5 + py * (w * 0.5)}
            Q${cx + px * (w * 0.5)} ${cy + py * (w * 0.5)}
              ${tipX - ux * 4 + px * (w * 0.35)} ${tipY - uy * 4 + py * (w * 0.35)}`}
        stroke="white" strokeWidth="1" fill="none" opacity={highlight} strokeLinecap="round"
      />
    </g>
  );
}

const CucumberAnimation = ({ stage, health }: Props) => {
  const config = stageConfig[stage];
  const colors = healthColors[health];
  const isUnhealthy = health === "unhealthy";

  const body      = isUnhealthy ? "#3A6B20" : health === "stressed" ? "#4E8A2A" : "#5BAD32";
  const dark      = isUnhealthy ? "#244010" : health === "stressed" ? "#2F5A18" : "#3A7A1E";
  const highlight = isUnhealthy ? 0.08 : 0.25;

  return (
    <div className="flex items-center justify-center h-100 sm:h-70 lg:h-110 w-80 sm:w-50 lg:w-90 bg-[#1a1a1a] rounded-xl overflow-hidden">
      <svg viewBox="0 0 100 120" className="w-45 h-50" fill="none" xmlns="http://www.w3.org/2000/svg">

        {/* Soil */}
        <rect x="25" y="100" width="50" height="8" rx="4" fill="#3B2A1A" />
        <rect x="30" y="103" width="40" height="3" rx="2" fill="#2A1A0A" opacity="0.5" />

        {/* Seed */}
        <AnimatePresence>
          {stage === "seedling" && (
            <motion.ellipse
              key="seed" cx="50" cy="97" rx="6" ry="4" fill="#A0522D"
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        {/* Sway group */}
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
                stroke={colors.stem} strokeWidth="3" strokeLinecap="round"
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
            return (
              <AnimatePresence key={leaf.key}>
                {shouldShow && (
                  <motion.path
                    key={`${leaf.key}-${health}`}
                    d={leaf.d} fill={colors.leaf}
                    style={{ originX: leaf.ox, originY: leaf.oy }}
                    custom={leaf.idx}
                    variants={isUnhealthy ? fallVariants : growVariants}
                    initial={isUnhealthy ? "visible" : "hidden"}
                    animate={isUnhealthy ? "fall" : "visible"}
                    exit="exit"
                  />
                )}
              </AnimatePresence>
            );
          })}

          {/* Bud */}
          <AnimatePresence>
            {config.showBud && (
              <motion.g
                key="bud"
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 1.8, type: "spring", stiffness: 260, damping: 20 }}
                style={{ originX: "50px", originY: "20px" }}
              >
                {[0, 72, 144, 216, 288].map((angle, i) => (
                  <ellipse
                    key={i}
                    cx={50 + 5 * Math.cos((angle * Math.PI) / 180)}
                    cy={20 + 5 * Math.sin((angle * Math.PI) / 180)}
                    rx="3.5" ry="2" fill={colors.bud}
                    transform={`rotate(${angle}, ${50 + 5 * Math.cos((angle * Math.PI) / 180)}, ${20 + 5 * Math.sin((angle * Math.PI) / 180)})`}
                  />
                ))}
                <circle cx="50" cy="20" r="2.5" fill="#F59E0B" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Cucumbers */}
          <AnimatePresence>
            {config.showCucumbers && cucumberData.map((c, i) => (
              <motion.g
                key={`cuc-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: c.delay, type: "spring", stiffness: 200, damping: 18 }}
                style={{ originX: `${c.attachX}px`, originY: `${c.attachY}px` }}
              >
                <Cucumber
                  attachX={c.attachX} attachY={c.attachY}
                  endX={c.endX}       endY={c.endY}
                  body={body} dark={dark} highlight={highlight}
                />
              </motion.g>
            ))}
          </AnimatePresence>
        </motion.g>
      </svg>
    </div>
  );
};

export default CucumberAnimation;