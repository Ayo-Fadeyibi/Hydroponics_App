import {
  Apple,
  ArrowRight,
  Cloud,
  Download,
  Droplets,
  Ruler,
  Scale,
  Sun,
  Thermometer,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import InputCard from "../../components/data/InputCard";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import MetricSelectField from "../../components/data/MetricSelectField";
import VariableSelectField from "../../components/data/VariableSelectField";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useContext } from "react";
import { ConfigureContext, FormContext } from "./DataContext";
import { generateExcel } from "./ExcelUtils";
import NextStepButton from "../../components/data/NextStepButton";

/**
 * Step 1 of the YieldIQ — lets the user configure their crop name,
 * choose a growth metric, select explanatory variables, and download a
 * pre-formatted Excel template before advancing to the upload step.
 *
 * @param nextStep - Advances the wizard to the upload step.
 * @param showIncompleteMessage - Whether to display the "please complete all fields" error.
 * @param setShowMessage - Setter to toggle `showIncompleteMessage`.
 */
export default function ConfigureStep({
  nextStep,
  showIncompleteMessage,
  setShowMessage,
}: ConfigureProps) {
  const { formData, setForm } = useContext(FormContext);
  const MIN_VARIABLE_SELECTIONS = 3;

  // Form validation callback
  const validateForm = () => {
    const errors: ErrorMessages = {};

    (["crop", "growthMetric"] as const).forEach((field) => {
      checkEmptyField(field, formData[field], errors);
    });

    if (formData.selectedExpVariables.size < MIN_VARIABLE_SELECTIONS) {
      errors.selectedExpVariables = `You must select at least ${MIN_VARIABLE_SELECTIONS} variables!`;
    }

    return errors;
  };

  // Error messages - calculated fresh everytime formData state change
  const errorMessages = validateForm();
  const formErrors: ErrorsType = {
    hasErrors: Object.keys(errorMessages).length > 0,
    messages: errorMessages,
  };

  // on click generate template -> pass to download excel function
  const handleGenerateTemplate = async () => {
    // form validation
    const errorMessages = validateForm();

    // set error message state
    if (Object.keys(errorMessages).length > 0) {
      // has errors
      setShowMessage(true);
    } else {
      setShowMessage(false);

      // Call function to generate + download formatted excel file
      try {
        await generateExcel(formData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to Save Question: ", error.message);
        }
      }
    }
  };

  const handleNextStep = () => {
    setForm((prev) => ({
      ...prev,
      uploadedFile: null,
      fileValidState: "invalid",
    }));
    nextStep();
  };
  return (
    <ConfigureContext.Provider
      value={{
        handleGenerateTemplate: handleGenerateTemplate,
        errors: formErrors,
        showIncompleteMessage: showIncompleteMessage,
        setShowIncompleteMessage: setShowMessage,
      }}
    >
      <div className=" flex flex-col gap-6">
        {inputFields.map((Field, id) => (
          <InputCard key={id}>
            <Field />
          </InputCard>
        ))}

        <NextStepButton
          text="Continue to Upload"
          icon={ArrowRight}
          onClick={handleNextStep}
          disabled={formErrors.hasErrors}
        />
      </div>
    </ConfigureContext.Provider>
  );
}

// Different input components for the Configure form data
const inputFields: React.ComponentType[] = [
  CropNameInput,
  GrowthMetricSelect,
  ExplVariableMultiSelect,
  DownloadExcel,
];

/**
 * Formatted input field (using shadcn Input component) that captures form data
 * about the user's crop name
 */
function CropNameInput() {
  const { formData, setForm } = useContext(FormContext);
  const { setShowIncompleteMessage, errors } = useContext(ConfigureContext);

  const handleCropNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      crop: e.target.value,
    }));
    setShowIncompleteMessage(false);
  };

  return (
    <CardHeader className="text-left pb-0">
      <div className="flex flex-col p-2 gap-3">
        <CardTitle>
          <p className="text-xs text-left text-grey-subtext">
            {"What crop are you growing?*".toUpperCase()}
          </p>
        </CardTitle>
        <CardDescription className="text-grey-subtext">
          This is used to name your data template file. Type any plant name.
        </CardDescription>
        <Input
          value={formData.crop}
          onChange={handleCropNameChange}
          type="text"
          placeholder="e.g. Tomato, Basil, Lettuce..."
        />
        <p className="text-xs text-red-700">{errors.messages.crop || ""}</p>
      </div>
    </CardHeader>
  );
}

/**
 * Custom radio-button select component that captures form data
 * about the growth metric that the user wants to measure
 */
function GrowthMetricSelect() {
  const { formData, setForm } = useContext(FormContext);
  const { setShowIncompleteMessage, errors } = useContext(ConfigureContext);

  const handleGrowthMetricSelect = (selectedMetric: string) => {
    setForm((prev) => ({
      ...prev,
      growthMetric: selectedMetric,
    }));
    setShowIncompleteMessage(false);
  };

  return (
    <CardHeader className="text-left pb-0">
      <div className="flex flex-col p-2 gap-3">
        <CardTitle>
          <p className="text-xs text-left text-grey-subtext">
            {"What growth metric are you measuring? *".toUpperCase()}
          </p>
        </CardTitle>
        <CardDescription className="text-grey-subtext">
          This is the outcome variable — what you want to predict.
        </CardDescription>

        {metricSelectOptions.map((select, idx) => (
          <MetricSelectField
            key={idx}
            metric={select.metric}
            description={select.description}
            units={select.units}
            icon={select.icon}
            handleSelect={handleGrowthMetricSelect}
            isSelected={formData.growthMetric === select.metric}
          />
        ))}
        {errors.hasErrors && errors.messages.growthMetric && (
          <p className="text-xs text-red-700">{errors.messages.growthMetric}</p>
        )}
      </div>
    </CardHeader>
  );
}

/**
 * Custom multi-select component to capture form data about which
 * explanatory variables the user will be measuring.
 */
function ExplVariableMultiSelect() {
  const { formData, setForm } = useContext(FormContext);
  const { setShowIncompleteMessage, errors } = useContext(ConfigureContext);

  const handleSelectVariable = (selected: string) => {
    const prevSelected = new Set(formData.selectedExpVariables);
    // deselected - already selected variables
    if (formData.selectedExpVariables.has(selected)) {
      prevSelected.delete(selected);
    } else {
      // select - if not already selected
      prevSelected.add(selected);
    }

    // update selection form
    setForm((prev) => ({
      ...prev,
      selectedExpVariables: prevSelected,
    }));

    setShowIncompleteMessage(false);
  };

  return (
    <CardHeader className="text-left pb-0">
      <div className="flex flex-col p-2 gap-3">
        <CardTitle className="font-semibold">
          <p className="text-xs text-left text-grey-subtext">
            {"Which explanatory variables are you measuring? *".toUpperCase()}
          </p>
          <p className="text-xs text-left text-grey-subtext mt-2">
            (select minimum 3)
          </p>
        </CardTitle>
        <CardDescription className="text-grey-subtext">
          Select all the sensor readings you record in your setup. These become
          the input columns in your data template.
        </CardDescription>
        <div className="grid grid-cols-2 gap-2">
          {variableOptions.map((select, idx) => (
            <VariableSelectField
              key={idx}
              variable={select.variable}
              icon={select.icon}
              onSelect={handleSelectVariable}
              isSelected={formData.selectedExpVariables.has(select.variable)}
            />
          ))}
        </div>
        {errors.hasErrors && errors.messages.selectedExpVariables && (
          <p className="text-xs text-red-700">
            {errors.messages.selectedExpVariables}
          </p>
        )}
      </div>
    </CardHeader>
  );
}

/**
 * Card that generates and downloads a pre-formatted Excel template based on
 * the user's current form selections. Shows an error if required fields are incomplete.
 */
function DownloadExcel() {
  const { showIncompleteMessage, handleGenerateTemplate } =
    useContext(ConfigureContext);

  return (
    <CardHeader className="text-left pb-0">
      <div className="flex flex-col p-2 gap-3">
        <CardTitle className="font-semibold">
          <p className="text-xs text-left text-grey-subtext">
            {"Download your data template".toUpperCase()}
          </p>
        </CardTitle>
        <CardDescription className="text-grey-subtext">
          Based on your selections above, we've generated a pre-formatted Excel
          template. Fill it in with your historical data before uploading.
          <p className="underline pt-2"> Important Instructions:</p>
          <ul className="list-disc ml-4 p-2">
            {generateExcelInstructions.map((instruction, i) => (
              <li key={i}>{instruction}</li>
            ))}
          </ul>
        </CardDescription>

        <Button
          size="lg"
          className="bg-primary-purple text-bg-white w-fit rounded-xl px-6 py-5 
              hover:cursor-pointer hover:bg-bg-white hover:border-primary-purple hover:text-primary-purple"
          onClick={handleGenerateTemplate}
        >
          Generate Template
          <Download />
        </Button>
        <p className="text-xs text-red-700">
          {showIncompleteMessage
            ? "Please complete input of all fields above!"
            : ""}
        </p>
      </div>
    </CardHeader>
  );
}

// Static Data for form input options

/** Props for the {@link ConfigureStep} component. */
interface ConfigureProps {
  nextStep: () => void;
  showIncompleteMessage: boolean;
  setShowMessage: React.Dispatch<React.SetStateAction<boolean>>;
}

/** Per-field validation error messages for the configure form. */
export interface ErrorMessages {
  crop?: string;
  growthMetric?: string;
  selectedExpVariables?: string;
}

/** Aggregated form error state used by {@link ConfigureStep} and {@link ConfigureContext}. */
export interface ErrorsType {
  hasErrors: boolean;
  messages: ErrorMessages;
}

/** Shape of a single metric option in the growth metric selector. */
interface metricData {
  metric: string;
  description: string;
  units: string;
  icon: LucideIcon;
}

/** Shape of a single variable option in the explanatory variable selector. */
interface variableData {
  variable: string;
  icon: LucideIcon;
}

const metricSelectOptions: metricData[] = [
  {
    metric: "Yield Weight",
    description: "The total harvested weight per plant or session",
    units: "grams (g)",
    icon: Scale,
  },
  {
    metric: "Plant Height",
    description: "Stem height measured from base to tip",
    units: "centimeters (cm)",
    icon: Ruler,
  },
  {
    metric: "Number of fruit",
    description: "Count of fruit or produce items per plant",
    units: "quantity",
    icon: Apple,
  },
];

const variableOptions: variableData[] = [
  { variable: "pH", icon: Droplets },
  { variable: "CO₂ carbon dioxide (ppm)", icon: Cloud },
  { variable: "Air Temperature (°C)", icon: Thermometer },
  { variable: "Water Temperature (°C)", icon: Waves },
  { variable: "Electrical Conductivity (EC)", icon: Zap },
  { variable: "RH - Relative Humidity (%)", icon: Wind },
  { variable: "DLI - Daily Light Integral", icon: Sun },
  {
    variable: "TDS - Total Dissolved Solids (g/L)",
    icon: Droplets,
  },
];

const generateExcelInstructions: string[] = [
  "Do not change column headers of generated file.",
  "Input a minimum of 15 rows/days of data to ensure reliable predictions.",
  "Add or remove rows to increase or decrease days of data (if required).",
  "Ensure all cells are filled. ",
];

/**
 * Helper function for form validation.
 * Checks if value in form is empty. If empty then updates provided errors object
 * by adding a property with the error message for that form field.
 * @param {string} field - the form field that we are validating input for
 * @param {*} value - the value in the form for the corresponding field
 * @param {Object} errors - the errors object to append to if an error is present
 */
function checkEmptyField(
  field: keyof ErrorMessages,
  value: string,
  errors: ErrorMessages,
) {
  if (!value) {
    errors[field] = "This field is required!";
  }
}
