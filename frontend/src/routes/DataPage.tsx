import { useState } from "react";
import ConfigureStep from "./data/ConfigureStep";
import UploadStep from "./data/UploadStep";
import ResultStep from "./data/ResultStep";
import InputCard from "../components/data/InputCard";
import { StepBar } from "../components/data/StepBar";
import { FormContext, type FormData } from "./data/DataContext";
import type { GraphResults, UserDataAdvice } from "../types/data-input-types";
import TutorialModal from "../components/data/YieldIQTutorialModal";
import { Play } from "lucide-react";

/**
 * YieldIQ page — manages the three-step wizard (Configure → Upload → Results)
 * and owns all shared form state via {@link FormContext}.
 * Also handles showing the {@link TutorialModal} via a "Tutorial" button in the header.
 * No props required.
 */
export default function DataPage() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currStep, setCurrStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    crop: "",
    growthMetric: "",
    selectedExpVariables: new Set<string>(),
    uploadedFile: null,
    fileValidState: "invalid",
    forecastDays: "",
  });
  const [graphResults, setGraphResults] = useState<GraphResults | null>(null);
  const [llmResults, setLlmResults] = useState<UserDataAdvice | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false);
  const [showIncompleteMessage, setShowIncompleteMessage] =
    useState<boolean>(false);

  const LAST_STEP = 3;
  const INITIAL_STEP = 1;
  const nextStep = () => setCurrStep(Math.min(LAST_STEP, currStep + 1));
  const prevStep = () => {
    setCurrStep(Math.max(INITIAL_STEP, currStep - 1));
  };

  return (
    <FormContext.Provider
      value={{
        setForm: setFormData,
        formData: formData,
        graphResults: graphResults,
        setGraphResults: setGraphResults,
        isLoadingResults: isLoadingResults,
        setIsLoadingResults: setIsLoadingResults,
        llmResults: llmResults,
        setLlmResults: setLlmResults,
      }}
    >
      <div className="flex justify-center items-center py-10 px-10 bg-bg-purple">
        <div className="flex flex-col w-full max-w-5xl">
          <div className="flex items-start justify-between">
            <div>
              <DataPageTitle title="YieldIQ" />
              <DataPageSubheading />
            </div>
            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center gap-3 cursor-pointer transition-colors text-green-600 hover:text-green-700 border border-green-600 hover:bg-green-50 text-sm font-medium py-2 px-4 rounded-lg mt-1 shrink-0"
            >
              <Play size={14} />
              <span className="text-sm">Tutorial</span>
            </button>
          </div>
          {showTutorial && (
            <TutorialModal onClose={() => setShowTutorial(false)} />
          )}
          <div className="flex flex-col gap-6">
            <InputCard>
              <StepBar currentStep={currStep} nextStepChange={() => {}} />
            </InputCard>
            {/* Conditionally render page content based on current step */}
            {currStep === 1 && (
              <ConfigureStep
                nextStep={nextStep}
                showIncompleteMessage={showIncompleteMessage}
                setShowMessage={setShowIncompleteMessage}
              />
            )}
            {currStep === 2 && (
              <UploadStep nextStep={nextStep} prevStep={prevStep} />
            )}
            {currStep === 3 && <ResultStep prevStep={prevStep} />}
          </div>
        </div>
      </div>
    </FormContext.Provider>
  );
}

/** Props for the {@link DataPageTitle} component. */
interface TitleProps {
  title: string;
}

/**
 * Responsive large heading for the YieldIQ page.
 *
 * @param title - Text to display as the heading.
 */
function DataPageTitle({ title }: TitleProps) {
  return (
    <p
      className="text-2xl text-left leading-[1.29167] text-balance 
    sm:text-2xl lg:text-3xl"
    >
      {title}
    </p>
  );
}

/**
 * Fixed-text subheading describing YieldIQ's purpose.
 * No props required.
 */
function DataPageSubheading() {
  return (
    <p className="text-m text-left pb-8 text-grey-subtext">
      Upload your historical growth data and get personalised yield forecasts
      trained on your actual setup.
    </p>
  );
}
