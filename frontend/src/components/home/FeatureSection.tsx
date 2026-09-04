import FeatureCard from "./FeatureCard";
import Title from "./Title";
import Subheading2 from "./Subheading2";
import { Beaker, TrendingUp, type LucideIcon } from "lucide-react";

interface FeatureCardData {
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
 * Container section holding all product features as {@link FeatureCard}s.
 */
const featureData: FeatureCardData[] = [
  {
    title: "SimLab",
    subtitle: "Configure. Lock. Calculate.",
    caption:
      "Configure your environmental conditions, lock the ones fixed in your setup, and press Simulate Growth. SimLab scores your configuration against AI-optimal targets and shows you the gap.",
    steps: [
      "Choose from 3 crop profiles (Lettuce, Cucumber, or Tomato) — each with calibrated AI targets",
      "Adjust sliders for pH, EC, CO₂, humidity, temperature and more — lock anything you can't control",
      "See your crop health score, animated plant lifecycle, and side-by-side AI comparison",
    ],
    buttonLabel: "Open SimLab",
    color: "#00A63E",
    icon: Beaker,
    link: "/simulate",
  },
  {
    title: "YieldIQ",
    subtitle: "Upload. Analyse. Forecast.",
    caption:
      "Upload a spreadsheet of your recorded growing sessions. YieldIQ fits a  regression model to your data to reveal what's actually driving your yields — then forecasts what your next harvest could look like.",
    steps: [
      "Upload a .xlsx or .xls file with your recorded conditions & harvest results",
      "Explore time-series charts and variable correlation analysis across your sessions",
      "Get a personalised yield forecast trained on your own growing history",
    ],
    buttonLabel: "Explore YieldIQ",
    color: "#7C3AED",
    icon: TrendingUp,
    link: "/data",
  },
];

export default function FeatureSection() {
  return (
    <div id="feature-section" className="py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-3">
        <Title title="Choose Your Analytics Tool" />
        <Subheading2 />
        <div className="flex flex-row gap-4">
          {featureData.map((ft, i) => (
            <FeatureCard
              key={i}
              title={ft.title}
              subtitle={ft.subtitle}
              caption={ft.caption}
              buttonLabel={ft.buttonLabel}
              steps={ft.steps}
              color={ft.color}
              icon={ft.icon}
              link={ft.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
