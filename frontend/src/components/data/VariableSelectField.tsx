import { type LucideIcon } from "lucide-react";
import Checkbox from "./Checkbox";

interface variableProps {
  variable: string;
  icon: LucideIcon;
  onSelect: (variable: string) => void;
  isSelected: boolean;
}

/**
 * Selectable row displaying a single explanatory variable with its icon.
 *
 * @param variable - Display name of the variable.
 * @param icon - Lucide icon component rendered alongside the variable name.
 * @param onSelect - Callback invoked with the variable name when the row is clicked.
 * @param isSelected - Whether this variable is currently selected.
 */
export default function VariableSelectField({
  variable,
  icon: Icon,
  onSelect,
  isSelected,
}: variableProps) {
  return (
    <div
      className={`flex flex-row justify-between items-center px-2 h-10 w-full rounded-md border-2 border-grey-nonselect  text-xs 
       ${isSelected ? "bg-bg-purple border-primary-purple" : "bg-grey-nonselect/20"}
      hover:border-primary-purple hover:cursor-pointer hover:shadow-md transition-shadow duration-300`}
      onClick={() => onSelect(variable)}
    >
      <div className="flex flex-row gap-3 items-center">
        <Icon size={16} />
        <p> {variable} </p>
      </div>
      {isSelected && <Checkbox />}
    </div>
  );
}
