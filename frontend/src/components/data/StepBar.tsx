"use client";

import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "../ui/stepper";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";

/** Props for the {@link StepBar} component. */
interface StepBarProps {
  currentStep: number;
  nextStepChange: () => void;
}

/**
 * Horizontal stepper bar showing the three workflow steps: Configure, Upload data, and Results.
 *
 * @param currentStep - 1-based index of the currently active step.
 * @param nextStepChange - Callback invoked when the user navigates between steps via the stepper.
 */
export function StepBar({ currentStep, nextStepChange }: StepBarProps) {
  return (
    <Stepper
      value={currentStep}
      onValueChange={nextStepChange}
      defaultValue={2}
      indicators={{
        completed: <CheckIcon className="size-4" />,
        loading: <LoaderCircleIcon className="size-4 animate-spin" />,
      }}
      className="flex justify-between px-7 py-2"
    >
      <StepperNav>
        {steps.map((step, index) => (
          <StepperItem key={index} step={index + 1} className="relative">
            <StepperTrigger className="flex items-center gap-3">
              {/* Icon to indicate steps */}
              <StepperIndicator
                className="
                size-8 text-sm
                text-bg-white
                group-data-[state=completed]/step:bg-green-500
                group-data-[state=active]/step:bg-violet-500
                group-data-[state=inactive]/step:bg-grey-subtext/25
            "
              >
                {index + 1}
              </StepperIndicator>
              <div className="flex flex-col items-start gap-0.5">
                <StepperTitle
                  className="
                    text-sm font-medium
                    group-data-[state=active]/step:text-primary-purple
                    group-data-[state=completed]/step:text-primary-green
                    group-data-[state=inactive]/step:text-black/30
                  "
                >
                  {step.title}
                </StepperTitle>
                <StepperDescription
                  className="
                    text-xs
                    group-data-[state=active]/step:text-black/70
                    group-data-[state=completed]/step:text-black/70
                    group-data-[state=inactive]/step:text-black/30
                  "
                >
                  {step.description}
                </StepperDescription>
              </div>
            </StepperTrigger>

            {/* Separator Progress Bar */}
            {steps.length > index + 1 && (
              <div className="flex flex-1 items-center justify-end">
                <StepperSeparator
                  className="
                    !flex-none mr-3 w-12 h-1
                    group-data-[state=completed]/step:bg-primary-green
                    group-data-[state=active]/step:bg-grey-subtext/25
                    group-data-[state=inactive]/step:bg-grey-subtext/25
                    "
                />
              </div>
            )}
          </StepperItem>
        ))}
      </StepperNav>
    </Stepper>
  );
}

/** Steps data for stepper display of feature 2 */
const steps = [
  { title: "Configure", description: "Crop, metric & variable" },
  { title: "Upload data", description: "Excel file & Validation" },
  { title: "Results", description: "Forecast & Insights" },
];
