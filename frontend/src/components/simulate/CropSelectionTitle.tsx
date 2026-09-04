import { ArrowRight, ChevronLeft } from "lucide-react";
import CropCardContainer from "./CropCardContainer";
import { Separator } from "../ui/separator";
import LargeButton from "../home/LargeButton";
import { Button } from "../ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Crop selection page shown at `/Simulate`.
 *
 * Lets the user pick one of the three supported crops (Cucumber, Lettuce,
 * Tomato) via {@link CropCardContainer}, then navigates to
 * `/simulate/<CropName>` when "Start Simulation" is clicked.
 * A back button returns to the home page.
 */
export default function CropSelection() {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  const navigate = useNavigate();

  /** Navigates to the simulation page for the selected crop, or alerts if none is chosen. */
  const handleCropSelection = () => {
    if (selectedCrop) {
      navigate(`/simulate/${selectedCrop}`);
    } else {
      alert("Please select a crop to start the simulation.");
    }
  };

  return (
    <div className="h-[80vh] flex items-center justify-center bg-bg-green/40">
      <div className="px-25 text-left">
        <div className="flex flex-row gap-3 items-top">
          <Button onClick={() => navigate("/")} className="mt-2 hover:cursor-pointer transition-transform duration-300 hover:scale-130">
            <ChevronLeft className="size-8!" />
          </Button>
          <div className="flex flex-col">
            <SelectCropTitle title="Select your crop" />
            <SelectCropSubheading />
          </div>
        </div>
        <CropCardContainer
          selectedCrop={selectedCrop}
          onSelect={(crop) => setSelectedCrop(crop)}
        />
        <div className="py-8">
          <Separator />
        </div>
        <LargeButton
          text="Start Simulation"
          icon={ArrowRight}
          disabled={!selectedCrop}
          onClick={handleCropSelection}
        />
      </div>
    </div>
  );
}

/** Props for {@link SelectCropTitle}. */
interface TitleProps {
  title: string;
}

/** Large heading displayed above the crop cards. */
function SelectCropTitle({ title }: TitleProps) {
  return (
    <p className="text-3xl text-left leading-[1.29167] text-balance sm:text-3xl lg:text-4xl">
      {title}
    </p>
  );
}

/** Sub-heading describing the AI-calibrated nature of the optimal ranges. */
function SelectCropSubheading() {
  return (
    <p className="text-lg text-left pb-8 text-grey-subtext">
      Each crop comes with AI-optimised target ranges for its key environmental conditions.
    </p>
  );
}
