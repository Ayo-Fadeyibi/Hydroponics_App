import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";

/** Props shared by step navigation buttons. */
export interface ButtonProps {
  text: string;
  icon?: LucideIcon;
  disabled?: boolean;
  onClick?: () => void;
}

/**
 * Styled forward-navigation button.
 *
 * @param text - Label text rendered inside the button.
 * @param icon - Optional Lucide icon rendered to the right of the label.
 * @param disabled - When `true`, the button is disabled.
 * @param onClick - Callback invoked when the button is clicked.
 */
export default function NextStepButton({
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
      className={`relative w-fit overflow-hidden rounded-lg 
        before:absolute before:inset-0 before:rounded-[inherit]
        before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)]
        before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0]
        before:bg-no-repeat before:transition-[background-position_0s_ease] before:duration-1000
        hover:before:bg-[position:-100%_0,0_0] has-[>svg]:px-6
        dark:before:bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_50%,transparent_75%,transparent_100%)]
        transition-all duration-300
        ${
          disabled
            ? "bg-primary-green text-bg-white cursor-not-allowed pointer-events-none"
            : "bg-primary-green text-bg-white hover:bg-green-700 hover:cursor-pointer"
        }`}
    >
      {text}
      {Icon && <Icon />}
    </Button>
  );
}
