import { Flag, Lock, Search, BarChart3, type LucideIcon } from "lucide-react";
import Subheading from "./Subheading";
import InfoCard from "./InfoCard";

interface CardData {
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Section displaying a row of {@link InfoCard}s that describe what HydroMind does.
 * Card data is hardcoded — no props required.
 */
export default function CardContainer() {
  return (
    <div className="bg-bg-green/40 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <Subheading />
        <div className="flex flex-row gap-6">
          {cardData.map((card, i) => (
            <InfoCard
              key={i}
              title={card.title}
              description={card.description}
              icon={card.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const cardData: CardData[] = [
  {
    title: "Diagnoses limiting factors",
    description:
      "Identifies which variables are holding back growth — and by how much.",
    icon: Search,
  },
  {
    title: "Optimises under constraints",
    description:
      "Lock variables you can't change. AI finds the best setup with what's left.",
    icon: Lock,
  },
  {
    title: "Compares scenarios",
    description:
      "Visualises your current setup vs AI-optimal across the full growth timeline.",
    icon: BarChart3,
  },
  {
    title: "Learns from your data",
    description: "Upload historical harvests for personalised forecasts.",
    icon: Flag,
  },
];
