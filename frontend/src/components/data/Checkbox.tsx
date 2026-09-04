import { Check } from "lucide-react";

/**
 * Customised purple checkbox icon, used when an item in a select list is active.
 */
export default function Checkbox() {
  return (
    <div className="bg-primary-purple rounded-4xl p-1">
      <Check size={14} color="white" />
    </div>
  );
}
