import {
  Play,
  Droplets,
  Zap,
  Sparkles,
  Thermometer,
  Wind,
  Sun,
  CloudFog,
  Lock,
} from "lucide-react";
import SensorRow, { type SensorConfig } from "./SensorRow";
import { useState } from "react";

/** Default sensor configs shared by all crop types (pH, EC, CO₂, Humidity, Air Temp). */
const commonSensors = (): SensorConfig[] => [
  {
    label: "pH Level",
    key: "Avg_pH",
    color: "#3B82F6",
    value: 6.3,
    min: 4.5,
    max: 8.0,
    target: 6.0,
    unit: "",
    icon: <Droplets size={14} />,
    step: 0.1,
    locked: false,
  },
  {
    label: "EC (mS/cm)",
    key: "Avg_EC",
    color: "#F59E0B",
    value: 2.2,
    min: 0.5,
    max: 5.0,
    target: 1.4,
    unit: "",
    icon: <Zap size={14} />,
    step: 0.1,
    locked: false,
  },
  {
    label: "CO₂ (ppm)",
    key: "Avg_CO2",
    color: "#6B7280",
    value: 810,
    min: 300,
    max: 1500,
    target: 800,
    unit: "",
    icon: <CloudFog size={14} />,
    step: 10,
    locked: false,
  },
  {
    label: "Humidity",
    key: "Avg_RH",
    color: "#10B981",
    value: 48,
    min: 30,
    max: 100,
    target: 55,
    unit: "%",
    icon: <Wind size={14} />,
    step: 0.1,
    locked: false,
  },
  {
    label: "Air Temp",
    key: "Avg_Air_Temp",
    color: "#EF4444",
    value: 22,
    min: 14,
    max: 35,
    target: 22,
    unit: "°C",
    icon: <Thermometer size={14} />,
    step: 0.1,
    locked: false,
  },
];

/**
 * Returns the initial sensor config array for a given crop.
 *
 * Lettuce gets Water Temp and TDS in addition to the common sensors.
 * All other crops (Tomato, Cucumber) get Light (DLI) instead.
 *
 * @param crop - Lowercase crop name (e.g. `"lettuce"`, `"tomato"`).
 * @returns Array of {@link SensorConfig} ready to pass to {@link EnvSliders}.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function initialSensorsForCrop(crop: string): SensorConfig[] {
  if (crop === "lettuce") {
    return [
      ...commonSensors(),
      {
        label: "Water Temp",
        key: "Avg_Water_Temp",
        color: "#60A5FA",
        value: 20,
        min: 14,
        max: 30,
        target: 20,
        unit: "°C",
        icon: <Droplets size={14} />,
        step: 0.1,
        locked: false,
      },
      {
        label: "TDS (ppm)",
        key: "Avg_TDS",
        color: "#8B5CF6",
        value: 1,
        min: 0,
        max: 4,
        target: 1.4,
        unit: "",
        icon: <Zap size={14} />,
        step: 0.1,
        locked: false,
      },
    ];
  }
  return [
    ...commonSensors(),
    {
      label: "Light (DLI)",
      key: "Avg_DLI",
      color: "#FBBF24",
      value: 14,
      min: 8,
      max: 60,
      target: 14,
      unit: "",
      icon: <Sun size={14} />,
      step: 0.1,
      locked: false,
    },
  ];
}

/** Pre-built lettuce sensor array — convenience export for non-route consumers. */
// eslint-disable-next-line react-refresh/only-export-components
export const initialSensors: SensorConfig[] = initialSensorsForCrop("lettuce");

/**
 * Panel of environmental sensor sliders for the simulation page.
 *
 * Renders one {@link SensorRow} per sensor. Each row lets the user drag a
 * value and optionally lock it so it is treated as a fixed constraint during
 * optimisation. After a simulation runs the "Apply AI Optimised Settings"
 * button appears; clicking it updates every *unlocked* sensor to its optimal
 * value without touching locked sensors.
 *
 * @param sensors       - Current sensor configs (value, min, max, locked, …).
 * @param onChange      - Called with the full updated sensor array on any change.
 * @param onSimulate    - Fired when the user clicks "Simulate Growth".
 * @param onApplyOptimal - Optional callback fired after optimal values are applied.
 * @param isLoading     - When true the simulate button is disabled and shows a spinner label.
 * @param optimalValues - Map of sensor key → optimal value returned by the optimise endpoint.
 */
interface Props {
  sensors: SensorConfig[];
  onChange: (sensors: SensorConfig[]) => void;
  onSimulate: () => void;
  onApplyOptimal?: () => void;
  isLoading?: boolean;
  optimalValues?: Record<string, number>;
}

export default function EnvSliders({
  sensors,
  onChange,
  onSimulate,
  onApplyOptimal,
  isLoading,
  optimalValues,
}: Props) {
  const [clicked, setClicked] = useState(false);

  /** Updates a single sensor value and resets the post-simulate state so the simulate button re-enables. */
  const handleChange = (key: string, val: number) => {
    onChange(sensors.map((s) => (s.key === key ? { ...s, value: val } : s)));
    setClicked(false);
  };

  /** Applies AI-optimal values to all unlocked sensors and notifies the parent. */
  const handleApplyOptimal = () => {
    if (!optimalValues) return;
    onChange(
      sensors.map((s) =>
        s.key in optimalValues && !s.locked
          ? { ...s, value: Math.round(optimalValues[s.key] * 10) / 10 }
          : s,
      ),
    );
    onApplyOptimal?.();
    setClicked(false);
  };

  /** Toggles the locked state of a single sensor by key and re-enables the simulate button. */
  const handleLockChange = (key: string, locked: boolean) => {
    onChange(sensors.map((s) => (s.key === key ? { ...s, locked } : s)));
    setClicked(false);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase text-left">
        Environmental Controls
      </p>
      <div className="flex flex-row gap-1 items-center mt-2">
        <Lock size={14} />
        <p className="text-xs text-gray-400">
          Lock any condition you can't change
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {sensors.map((s) => (
          <SensorRow
            key={s.key}
            sensor={s}
            onChange={handleChange}
            onLockChange={handleLockChange}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {clicked ? (
          <button
            onClick={handleApplyOptimal}
            className="bg-green-600 text-white p-3 rounded-xl text-sm font-medium shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles size={14} />
            Apply AI Optimised Settings
          </button>
        ) : (
          <button className="hidden"></button>
        )}
        <button
          onClick={() => {
            onSimulate();
            setClicked(true);
          }}
          disabled={isLoading || clicked}
          className={`${clicked || isLoading ? "bg-gray-300 cursor-not-allowed pointer-events-none" : "bg-green-600 text-white hover:bg-green-700"} p-3 rounded-xl text-sm font-medium shadow-lg flex items-center justify-center gap-2 cursor-pointer`}
        >
          <Play size={14} />
          {isLoading ? "Simulating…" : "Simulate Growth"}
        </button>
      </div>
    </div>
  );
}
