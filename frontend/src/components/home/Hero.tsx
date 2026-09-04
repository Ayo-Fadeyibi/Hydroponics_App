import "../../index.css";
import { Badge } from "../ui/badge";
import { ArrowRight, Leaf } from "lucide-react";
import LargeButton from "./LargeButton";

/**
 * Full-width hero section with headline, subheading, and a CTA button that
 * smooth-scrolls to the feature section on click. No props required.
 */
export default function Hero() {
  return (
    <section className="bg-bg-green/40 pt-16 pb-12 sm:pb-16 lg:pb-24 ">
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-16 px-6">
        {/* Hero Header */}
        <div className="flex max-w-4xl flex-col items-center gap-4 self-center text-center">
          <Badge
            variant="secondary"
            className="text-sm text-dark-green font-normal bg-pill-bg-green"
          >
            <Leaf data-icon="inline-start" />
            AI-Powered Hydroponic Analytics
          </Badge>
          <p className="text-3xl leading-[1.29167] text-balance sm:text-4xl lg:text-5xl">
            Optimise Your Hydroponic Farm with{" "}
            <span className="text-primary-green">Predictive Intelligence</span>
          </p>
          <p className="text-muted-foreground mx-auto max-w-2xl text-l">
            Data-driven platform that simulates plant growth conditions,
            predicts outcomes using AI models, and supports intelligent
            decision-making for maximum yield.
          </p>
          <div className="z-10 flex items-center p-2">
            <LargeButton
              text="Get Started"
              icon={ArrowRight}
              onClick={() => {
                const scrollTo = document.getElementById("feature-section");
                scrollTo?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
