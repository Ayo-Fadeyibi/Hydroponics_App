import { Card, CardHeader, CardContent } from "../ui/card";

/** Props for the internal {@link CropCard} component. */
interface CropCardProps {
  crop: string;
  icon: string;
  description: string;
  subtitle: string;
  selected?: boolean;
  onSelect: () => void;
}

/**
 * Grid of selectable crop cards for the crop-selection screen.
 *
 * Renders one {@link CropCard} for each supported crop (Cucumber, Lettuce,
 * Tomato). Clicking a card selects it; clicking again deselects it.
 *
 * @param selectedCrop - The currently selected crop name, or null if none.
 * @param onSelect     - Called with the new selection (or null to deselect).
 */
interface ContainerProps {
  selectedCrop: string | null;
  onSelect: (crop: string | null) => void;
}

/** Static crop metadata used to populate the selection cards. */
const crops = [
  { crop: "Cucumber", icon: "🥒", description: "Needs higher humidity and consistent EC for fruit development" },
  { crop: "Lettuce",  icon: "🥬", description: "Forgiving on most variables — a great first crop" },
  { crop: "Tomato",   icon: "🍅", description: "Highest yield potential — needs strong light and CO₂" },
];

export default function CropCardContainer({ selectedCrop, onSelect }: ContainerProps) {

  return (
    <div className="flex flex-row gap-3">
      {crops.map((crop, i) => (
        <CropCard
          key={i}
          {...crop}
          selected={selectedCrop === crop.crop}
          onSelect={() => onSelect(selectedCrop === crop.crop ? null : crop.crop)}
        />
      ))}
    </div>
  );
}

/**
 * A single selectable crop card.
 * Highlights with a green ring when `selected` is true.
 */
function CropCard({ crop, icon, description, selected, onSelect }: CropCardProps) {
  return (
    <Card
      className={`py-8 px-4 w-full max-w-lg ring-2 border-secondary-green bg-bg-white hover:cursor-pointer hover:shadow-xl transition-shadow duration-300
        ${selected ? "ring-secondary-green bg-bg-green" : "ring-bg-green/50 hover:ring-secondary-green"}`}
      onClick={onSelect}
    >
      <CardHeader className="text-left pb-0 gap-3">
        <div className="text-4xl">{icon}</div>
        <p className="text-xl font-semibold">{crop}</p>
      </CardHeader>
      <CardContent className="text-left flex flex-col gap-3">
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}