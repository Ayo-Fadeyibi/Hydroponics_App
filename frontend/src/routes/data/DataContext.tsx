import { createContext } from "react";
import type { ErrorsType } from "./ConfigureStep";
import type {
  GraphResults,
  UserDataAdvice,
} from "../../types/data-input-types";

/** Shape of the shared form state provided by {@link FormContext}. */
interface FormState {
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  formData: FormData;
  graphResults: GraphResults | null;
  setGraphResults: React.Dispatch<React.SetStateAction<GraphResults | null>>;
  llmResults: UserDataAdvice | null;
  setLlmResults: React.Dispatch<React.SetStateAction<UserDataAdvice | null>>;
  isLoadingResults: boolean;
  setIsLoadingResults: React.Dispatch<React.SetStateAction<boolean>>;
}

/** Represents the current validation state of an uploaded Excel file. */
export type FileValidationState = "valid" | "validating" | "invalid";

/** The YieldIQ wizard form data shared across all steps via {@link FormContext}. */
export interface FormData {
  crop: string;
  growthMetric: string;
  selectedExpVariables: Set<string>;
  uploadedFile: File | null;
  fileValidState: FileValidationState;
  forecastDays: string;
}

/** React context providing wizard form state and result setters to all YieldIQ steps. */
export const FormContext = createContext<FormState>({
  setForm: () => {},
  formData: {
    crop: "",
    growthMetric: "",
    selectedExpVariables: new Set<string>(),
    uploadedFile: null,
    fileValidState: "invalid",
    forecastDays: "",
  },
  graphResults: null,
  setGraphResults: () => {},
  isLoadingResults: false,
  setIsLoadingResults: () => {},
  llmResults: null,
  setLlmResults: () => {},
});

/** Shape of the state provided by {@link ConfigureContext} to configure-step sub-components. */
export interface ConfigureState {
  handleGenerateTemplate: () => void;
  errors: ErrorsType;
  showIncompleteMessage: boolean;
  setShowIncompleteMessage: React.Dispatch<React.SetStateAction<boolean>>;
}

/** React context scoped to {@link ConfigureStep}, providing template generation and form error state. */
export const ConfigureContext = createContext<ConfigureState>({
  handleGenerateTemplate: () => {},
  errors: {
    hasErrors: true,
    messages: {},
  },
  showIncompleteMessage: false,
  setShowIncompleteMessage: () => {},
});
