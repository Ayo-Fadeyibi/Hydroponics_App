import { type LucideIcon } from "lucide-react";
import Checkbox from "./Checkbox";

interface metricProps {
  metric: string;
  description: string;
  units: string;
  icon: LucideIcon;
  handleSelect: (metric: string) => void;
  isSelected: boolean;
}

/**
 * Selectable row displaying a metric with its icon, description, and unit badge.
 * Highlights when selected and shows a {@link Checkbox} indicator.
 *
 * @param metric - Display name of the metric.
 * @param description - Short description shown beneath the metric name.
 * @param units - Unit label rendered as a badge (e.g. "°C", "ppm").
 * @param icon - Lucide icon component rendered alongside the metric name.
 * @param handleSelect - Callback invoked with the metric name when the row is clicked.
 * @param isSelected - Whether this metric is currently selected.
 */
export default function MetricSelectField({
  metric,
  description,
  units,
  icon: Icon,
  handleSelect,
  isSelected,
}: metricProps) {
  return (
    <div
      className={`flex flex-row justify-between items-center py-3 px-3 w-full rounded-md border-2 border-grey-nonselect 
        ${isSelected ? "bg-bg-purple border-primary-purple" : "bg-grey-nonselect/20"}
        hover:border-primary-purple hover:cursor-pointer
        hover:shadow-md transition-shadow duration-300 `}
      onClick={() => handleSelect(metric)}
    >
      <div className="flex flex-row gap-3 items-center">
        <Icon />
        <div className="flex flex-col">
          <p> {metric} </p>
          <p className="text-xs text-grey-subtext"> {description} </p>
        </div>
      </div>
      <div className="flex flex-row gap-3">
        <p className="px-2 py-0.5 rounded-lg bg-grey-nonselect h-fit text-grey-subtext text-xs">
          {units}
        </p>
        {isSelected && <Checkbox />}
      </div>
    </div>
  );
}
