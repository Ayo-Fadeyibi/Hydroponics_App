import { Button } from "../ui/button";
import type { ButtonProps } from "./NextStepButton";

/**
 * Back-navigation button.
 * Shares {@link ButtonProps} with {@link NextStepButton}.
 *
 * @param text - Label text rendered inside the button.
 * @param icon - Optional Lucide icon rendered to the left of the label.
 * @param disabled - When `true`, the button is disabled.
 * @param onClick - Callback invoked when the button is clicked.
 */
export default function PreviousStepButton({
  text,
  icon: Icon,
  disabled,
  onClick,
}: ButtonProps) {
  return (
    <Button
      size="lg"
      disabled={disabled}
      onClick={onClick}
      className={`relative w-fit overflow-hidden rounded-xl
        before:absolute before:inset-0 before:rounded-[inherit]
        before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)]
        before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0]
        before:bg-no-repeat before:transition-[background-position_0s_ease] before:duration-1000
        hover:before:bg-[position:-100%_0,0_0] has-[>svg]:px-6
        transition-all duration-300
        ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none border border-gray-200"
            : "bg-gray-100 text-gray-700 border border-gray-400 hover:bg-gray-200 hover:text-gray-900 hover:cursor-pointer"
        }`}
    >
      {Icon && <Icon />}
      {text}
    </Button>
  );
}
