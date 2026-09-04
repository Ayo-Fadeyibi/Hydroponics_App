import type { SensorConfig } from "../VariableSliders/SensorRow";

interface Props {
  sensors: SensorConfig[];
}

/**
 * Classifies a sensor reading relative to its target.
 *
 * @param value  - Current sensor value.
 * @param target - AI-optimal target value.
 * @param step   - Slider step size used as the tolerance band.
 * @returns `"on-target"` | `"increase"` | `"decrease"`
 */
function getStatus(value: number, target: number, step: number) {
  const diff = Math.abs(value - target);
  if (diff <= step) return "on-target";
  return value < target ? "increase" : "decrease";
}

/**
 * Per-sensor condition summary shown below the plant panels after a simulation.
 *
 * Compares each sensor's current `value` against its AI-optimal `target`.
 * A sensor is "on target" if it is within one `step` of the target; otherwise
 * it is labelled with a direction (↑ Increase / ↓ Decrease) and the exact
 * delta needed. A progress bar at the bottom summarises what percentage of
 * conditions are currently met.
 *
 * @param sensors - Committed sensor snapshot from the last simulate click.
 */
export default function ConditionCheck({ sensors }: Props) {
  const onTarget  = sensors.filter(s => getStatus(s.value, s.target, s.step) === "on-target").length;
  const needsWork = sensors.length - onTarget;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700 uppercase tracking-widest">Condition Check</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-medium">{onTarget} on target</span>
          {needsWork > 0 && (
            <span className="text-xs text-red-600 font-medium">{needsWork} need adjustment</span>
          )}
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col divide-y divide-gray-50">
        {sensors.map((s) => {
          const status = getStatus(s.value, s.target, s.step);
          const isOnTarget  = status === "on-target";
          const isIncrease  = status === "increase";
          const isDecrease  = status === "decrease";

          return (
            <div key={s.key} className="flex items-center justify-between py-2.5 border-b-black">

              {/* Label + icon */}
              <div className="flex items-center gap-2 w-32 shrink-0">
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="text-sm text-gray-600">{s.label}</span>
              </div>

              {/* Current → Target */}
              <div className="flex items-center gap-2 flex-1 justify-end">
                {
                  isOnTarget ? (
                    <span className="text-sm font-medium text-green-600">{s.value}{s.unit}</span>
                  ) : (
                    <>
                      <span className="text-sm text-red-600">{s.value}{s.unit}</span>
                      <span className="text-sm text-gray-400">→</span>
                      <span className="text-sm font-medium text-gray-800">{s.target}{s.unit}</span>
                    </>
                  )
                }
                

                {/* Status indicator */}
                <div className="w-30 flex justify-end">
                  {isOnTarget ? (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium shadow-lg">✓</span>
                  ) : (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shadow-lg ${isIncrease ? "bg-red-50 text-red-600" : isDecrease ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"}`}>
                      {isIncrease ? `↑ Increase by ${(s.target - s.value).toFixed(1)}` :
                      isDecrease ? `↓ Decrease by ${(s.value - s.target).toFixed(1)}` :
                      "On Target"}
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Summary bar */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(onTarget / sensors.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          {Math.round((onTarget / sensors.length) * 100)}% conditions met
        </span>
      </div>
    </div>
  );
}