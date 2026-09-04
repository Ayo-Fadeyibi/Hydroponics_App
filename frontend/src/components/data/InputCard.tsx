import type React from "react";
import { Card } from "../ui/card";

/**
 * Wrapper card container for data input sections.
 *
 * @param children - Content to render inside the card.
 */
export default function InputCard({ children }: { children: React.ReactNode }) {
  return (
    <Card
      size="sm"
      className="pb-0 mx-auto w-full ring-1 ring-grey-outline/50 bg-bg-white "
    >
      {children}
    </Card>
  );
}
