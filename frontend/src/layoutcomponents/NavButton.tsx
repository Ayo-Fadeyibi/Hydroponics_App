import { Button } from "../components/ui/button";

/** Props for the {@link NavButton} component. */
interface NavButtonProps {
  title: string;
  isCurrPage: boolean;
}

/**
 * Pill-shaped navigation button used in {@link NavBar}.
 * Highlighted with the green background when it represents the current page.
 *
 * @param title - Label text displayed inside the button.
 * @param isCurrPage - When `true`, applies the active background colour.
 */
export default function NavButton({ title, isCurrPage }: NavButtonProps) {
  return (
    <Button
      className="rounded-3xl px-6 py-6 hover:cursor-pointer hover:bg-bg-green/50 transition-colors duration-200"
      style={{
        backgroundColor: isCurrPage
          ? "var(--color-bg-green)"
          : "var(--color-bg-white)",
      }}
    >
      {title}
    </Button>
  );
}
