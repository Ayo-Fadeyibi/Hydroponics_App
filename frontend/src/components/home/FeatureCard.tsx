import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  subtitle: string;
  caption: string;
  steps: string[];
  buttonLabel: string;
  color: string;
  icon: LucideIcon;
  link: string;
}

/**
 * Feature card presenting a feature with numbered steps and button.
 *
 * @param title - Feature name (e.g. "SimLab").
 * @param subtitle - Short tagline displayed beneath the title.
 * @param caption - Paragraph describing what the feature does.
 * @param steps - Ordered list of steps shown as a numbered list.
 * @param buttonLabel - Text label for the call-to-action button.
 * @param color - Hex accent colour applied to the border, icon background, and button.
 * @param icon - Lucide icon rendered in the accent-coloured icon badge.
 * @param link - React Router path the button navigates to.
 */
export default function FeatureCard({
  title,
  subtitle,
  caption,
  steps,
  buttonLabel,
  color,
  icon: Icon,
  link,
}: FeatureCardProps) {
  return (
    <Card
      size="sm"
      className="!py-6 px-4 mx-auto w-full max-w-lg ring-2 ring-[var(--accent)]/50 bg-bg-white hover:ring-[var(--accent)] hover:cursor-pointer hover:shadow-xl transition-shadow duration-300"
      style={
        {
          backgroundColor: `${color}15`,
          borderColor: color,
          "--accent": color,
        } as CSSProperties
      }
    >
      <CardHeader className="text-left pb-0 gap-3">
        <div
          className="w-12 h-12 flex items-center rounded-xl justify-center bg-[var(--variable-color)] text-bg-white"
          style={{ "--variable-color": color } as CSSProperties}
        >
          <Icon />
        </div>
        <p className="text-xl font-semibold">{title}</p>
        <p className="text-lg">{subtitle}</p>
      </CardHeader>
      <CardContent className="text-left flex flex-col gap-4">
        {/* Caption */}
        <p className="text-muted-foreground text-sm">{caption}</p>

        {/* Numbered Steps */}
        <ol className="flex flex-col gap-3">
          {steps.map((step, idx) => (
            <li key={idx} className="flex flex-row gap-2">
              <span className="font-semibold text-sm" style={{ color }}>
                {idx + 1}
              </span>
              <span className="text-sm">{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
      <CardFooter className="pb-6">
        <Link to={link}>
          <Button
            size="lg"
            className="text-bg-white relative w-fit overflow-hidden rounded-3xl px-6 py-5 before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:transition-[background-position_0s_ease] before:duration-1000 hover:before:bg-[position:-100%_0,0_0] has-[>svg]:px-6 dark:before:bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_50%,transparent_75%,transparent_100%)] hover:cursor-pointer"
            style={{ backgroundColor: color }}
          >
            {buttonLabel}
            <ArrowRight />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
