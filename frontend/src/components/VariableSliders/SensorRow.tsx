import { Slider } from "../ui/slider";
import type { ReactNode } from "react";
import { Lock, Unlock, Info } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Configuration for a single environmental sensor slider.
 *
 * @property label  - Human-readable name shown in the UI (e.g. "pH Level").
 * @property key    - API field name used in sensor payloads (e.g. `"Avg_pH"`).
 * @property color  - Hex colour for the sensor icon.
 * @property value  - Current slider value.
 * @property min    - Minimum allowed value.
 * @property max    - Maximum allowed value.
 * @property target - AI-optimal target value shown in {@link ConditionCheck}.
 * @property unit   - Display unit appended to values (e.g. `"°C"`, `"%"`).
 * @property icon   - Icon element rendered alongside the label.
 * @property step   - Slider increment and tolerance band for condition checking.
 * @property locked - When true the slider is frozen and excluded from optimisation.
 */
export interface SensorConfig {
  label: string;
  key: string;
  color: string;
  value: number;
  min: number;
  max: number;
  target: number;
  unit: string;
  icon: ReactNode;
  step: number;
  locked: boolean;
}

/**
 * A single sensor row: lock toggle, label with tooltip, draggable slider,
 * and floating value label.
 *
 * When `sensor.locked` is true the slider thumb is visually disabled and
 * pointer events are suppressed so the value cannot be changed.
 *
 * @param sensor       - The sensor config to render.
 * @param onChange     - Called with `(key, newValue)` on slider drag.
 * @param onLockChange - Called with `(key, locked)` when the toggle is clicked.
 */
interface Props {
  sensor: SensorConfig;
  onChange: (key: string, val: number) => void;
  onLockChange: (key: string, locked: boolean) => void;
}

/** Tooltip descriptions shown on the info icon for each sensor label. */
const description: Record<string, string> = {
  "pH Level": "Measures the acidity or alkalinity of the nutrient solution. Optimal pH ensures plants can absorb nutrients effectively.",
  "EC (mS/cm)": "Electrical Conductivity measures the concentration of dissolved nutrients. Higher EC means more nutrients.",
  "Water Temp": "Temperature of the nutrient solution. Affects oxygen levels, nutrient uptake, and root health.",
  "Air Temp": "Air temperature in the growing environment. Affects plant metabolism and photosynthesis rate.",
  "Humidity": "Relative humidity in the growing environment. Affects transpiration rate and nutrient uptake through leaves.",
  "Light (DLI)": "Daily Light Integral — total light energy received per day. Critical for photosynthesis and plant growth.",
  "CO₂ (ppm)": "Carbon dioxide concentration in parts per million. Essential for photosynthesis and enhanced plant growth.",
  "TDS (ppm)": "Total Dissolved Solids — measures the total concentration of dissolved substances in the nutrient solution.",
}

export default function SensorRow({ sensor: s, onChange, onLockChange }: Props) {

  const pct = ((s.value - s.min) / (s.max - s.min)) * 100;
  const THUMB_SIZE = 14;


  return (
    <div className= {"w-full p-4 rounded-lg border " + (s.locked ? "bg-gray-100" : "border-gray-300")}>
      <div className="flex items-center justify-between mb-2">
        <div className="lockButtons">
         <button
          onClick={() => onLockChange(s.key, !s.locked)}
          className={`relative flex items-center w-9 h-6 rounded-full transition-colors duration-300 cursor-pointer
            ${s.locked ? "bg-green-600" : "bg-gray-300"}`}
        >
          {/* sliding circle */}
          <motion.div
            className="absolute w-5 h-5 bg-white rounded-full shadow flex items-center justify-center"
            animate={{ x: s.locked ? 15 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {s.locked
              ? <Lock size={10} className="text-green-600" />
              : <Unlock size={10} className="text-gray-400" />
            }
          </motion.div>
        </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 12, color: s.color }}>{s.icon}</span>
          <span className={"text-xs font-medium " + (s.locked ? "text-gray-400" : "text-gray-700")}>{s.label}</span>
          {s.label in description && (
            <div className="relative group">
              <Info size={11} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
              <div className="hidden group-hover:flex flex-col gap-1 absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 w-52
                bg-gray-900 text-white rounded-xl shadow-2xl p-3">
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 rotate-45 rounded-sm" />
                <p className="text-[11px] font-semibold text-white">{s.label}</p>
                <p className="text-[11px] text-gray-300 leading-relaxed">{description[s.label]}</p>
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="relative mt-9">
        {/* Floating value label */}
        <div
          className="absolute -top-9 w-10 transform -translate-x-1/2 text-[10px] font-medium text-white bg-gray-800 px-1.5 py-0.5 rounded pointer-events-none"
          style={{
            left: `calc(${pct}% - ${THUMB_SIZE / 2}px + ${(1 - pct / 55) * THUMB_SIZE}px)`,
            transform: "translateX(12%)",
          }}
        >
          {s.value}{s.unit}
        </div>

        <div className={"px-1 mt-4 " + (s.locked ? "bg-gray-300" : "bg-black")}>
          <Slider
            value={[s.value]}
            min={s.min}
            max={s.max}
            step={s.step}
            onValueChange={([val]) => onChange(s.key, val)}
            className={"**:[[role=slider]]:bg-white **:[[role=slider]]:border **:[[role=slider]]:border-gray-300 **:[[role=slider]]:shadow-sm **:[[role=slider]]:w-3.5 **:[[role=slider]]:h-3.5 " + (s.locked ? "**:[[role=slider]]:bg-gray-400 cursor-not-allowed pointer-events-none" : "**:[[role=slider]]:bg-black cursor-pointer")}
          />
        </div>
      </div>

      <div className="flex justify-between mt-1">
          <span className="text-[12px] text-gray-400">{s.min}{s.unit}</span>
          <span className="text-[12px] text-gray-400">{s.max}{s.unit}</span>
      </div>
    </div>
  );
}
