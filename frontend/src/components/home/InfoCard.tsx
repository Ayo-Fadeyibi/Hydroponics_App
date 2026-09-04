import { type LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

/** Props for the {@link InfoCard} component. */
interface InfoCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Small info card showing an icon, title, and description.
 * Used in {@link CardContainer} to list platform capabilities.
 *
 * @param title - Heading text for the card.
 * @param description - Supporting text displayed beneath the title.
 * @param icon - Lucide icon rendered at the top of the card.
 */
export default function InfoCard({
  title,
  description,
  icon: Icon,
}: InfoCardProps) {
  return (
    <Card
      size="sm"
      className="pb-0 mx-auto w-full max-w-sm ring-1 ring-grey-outline/50 bg-bg-white "
    >
      <CardHeader className="text-left pb-0">
        <div className="flex flex-col p-2 gap-2">
          <Icon />
          <CardTitle className="font-semibold">{title}</CardTitle>
          <CardDescription className="text-grey-subtext">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
