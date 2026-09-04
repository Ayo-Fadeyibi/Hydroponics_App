import { ArrowLeft, ArrowRight, Check, Folder, X } from "lucide-react";
import InputCard from "../../components/data/InputCard";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useContext, useRef, useState } from "react";
import { read, utils, type WorkBook } from "xlsx";
import { FormContext } from "./DataContext";
import { getGrowthMetricHeader } from "./ExcelUtils";
import type {
  GraphResults,
  UserDataAdvice,
} from "../../types/data-input-types";
import PreviousStepButton from "../../components/data/PreviousStepButton";
import NextStepButton from "../../components/data/NextStepButton";
import { Input } from "../../components/ui/input";

/**
 * Step 2 of the YieldIQ — handles Excel file upload, client-side
 * validation, forecast day input, and submission to the backend.
 * Fires parallel requests for the growth forecast graph and LLM recommendations
 * before advancing to the results step.
 *
 * @param nextStep - Advances the results step.
 * @param prevStep - Returns to the configure step.
 */
export default function UploadStep({ nextStep, prevStep }: UploadProps) {
  const {
    formData,
    setForm,
    setGraphResults,
    setIsLoadingResults,
    setLlmResults,
  } = useContext(FormContext);
  const [validationMessage, setValidationMessages] =
    useState<ValidationMessages>({
      hasEmptyFields: "",
      hasNonNumericField: "",
      hasInvalidHeaders: "",
      noFileUploaded: "",
      invalidFileType: "",
      hasMinimumRowNumber: "",
    });
  const [showValidationBox, setShowValidationBox] = useState<boolean>(
    formData.uploadedFile !== null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const forecastDayNum = parseInt(formData.forecastDays);
  const hasInputError =
    isNaN(forecastDayNum) ||
    forecastDayNum <= 0 ||
    forecastDayNum > 200 ||
    formData.forecastDays === "";

  // handle input and error validation for forecast_days input
  const handleForecastDayInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const days: string = e.target.value;

    setForm((prev) => ({
      ...prev,
      forecastDays: days,
    }));
  };

  // get expected column headers from form inputs
  const getExpectedColumns = () => {
    return [
      ...formData.selectedExpVariables,
      "Days",
      getGrowthMetricHeader(formData.growthMetric),
    ];
  };

  // handle resetting file states, parsing file, validating file when file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, fileValidState: "invalid" }));
    resetValidationMessages();
    setShowValidationBox(false);

    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setForm((prev) => ({ ...prev, uploadedFile: selectedFile }));

    // 1) Validate file type - check MIME type OR extension as fallback
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];
    const validExtensions = [".xlsx", ".xls"];
    const hasValidType = validTypes.includes(selectedFile.type);
    const hasValidExtension = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext),
    );
    if (!hasValidType && !hasValidExtension) {
      setValidationMessages((prev) => ({
        ...prev,
        invalidFileType: "Please upload a valid Excel file (.xlsx or .xls).",
      }));
      setShowValidationBox(true);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // 2) Validate EXCEL file contents
    const reader = new FileReader();

    reader.onload = (event) => {
      const fileContent = event.target?.result as ArrayBuffer;
      const wb = read(fileContent);

      handleValidateFile(wb);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // Helper function to handle file validation (given excel workbook)
  const handleValidateFile = (wb?: WorkBook) => {
    resetValidationMessages();

    if (!wb) {
      setValidationMessages((prev) => ({
        ...prev,
        noFileUploaded: "Please upload an .xlsx file before validating...",
      }));
      setShowValidationBox(true);
      return;
    }

    setForm((prev) => ({ ...prev, fileValidState: "validating" }));

    const worksheetName = wb.SheetNames[0];
    const worksheet = wb.Sheets[worksheetName];

    const rawRowData = utils.sheet_to_json(worksheet, {
      header: 1,
    }) as unknown[][];

    const headerIndex = rawRowData.findIndex((row) =>
      (row as unknown[]).some(
        (cell) => String(cell).trim().toLowerCase() === "days",
      ),
    );

    if (headerIndex === -1) {
      setForm((prev) => ({ ...prev, fileValidState: "invalid" }));
      setValidationMessages((prev) => ({
        ...prev,
        hasInvalidHeaders:
          "Your file is missing required columns, please ensure all columns are present.",
      }));
      setShowValidationBox(true);
      return;
    }

    const rawJsonRowData = utils.sheet_to_json(worksheet, {
      range: headerIndex,
      defval: null,
    }) as Record<string, unknown>[];

    // enables accidental empty day rows at end - by slicing json at first empty row
    const firstEmptyRowIndex = rawJsonRowData.findIndex((row) =>
      Object.entries(row)
        .filter(([key]) => key.toLowerCase() !== "days")
        .every(
          ([, cell]) =>
            cell === null || cell === undefined || String(cell).trim() === "",
        ),
    );
    const jsonRowData =
      firstEmptyRowIndex === -1
        ? rawJsonRowData
        : rawJsonRowData.slice(0, firstEmptyRowIndex);

    if (!jsonRowData || jsonRowData.length === 0) {
      setValidationMessages((prev) => ({
        ...prev,
        hasMinimumRowNumber:
          "There is an insufficient number of 'Day' data, please input a minimum of 15 days of data.",
      }));
      setForm((prev) => ({
        ...prev,
        fileValidState: "invalid",
      }));
      setShowValidationBox(true);
      return;
    }

    // Validation for parsed jsonRowData
    const currentHeaders = Object.keys(jsonRowData[0]);
    const hasValidHeaders = (() => {
      if (currentHeaders.length < getExpectedColumns().length) {
        setValidationMessages((prev) => ({
          ...prev,
          hasInvalidHeaders:
            "Your file is missing required columns, please ensure all columns are present.",
        }));
        return;
      } else if (currentHeaders.length > getExpectedColumns().length) {
        setValidationMessages((prev) => ({
          ...prev,
          hasInvalidHeaders:
            "Your file contains extra columns, please ensure only required columns are present.",
        }));
        return;
      }

      const validHeaders =
        currentHeaders.length === getExpectedColumns().length &&
        [...currentHeaders]
          .sort()
          .every(
            (value, index) => value === getExpectedColumns().sort()[index],
          );

      if (!validHeaders) {
        setValidationMessages((prev) => ({
          ...prev,
          hasInvalidHeaders:
            "Your file contains invalid headers, please ensure your Growth Metric and Explanatory Variable column headers are valid.",
        }));
      }

      return validHeaders;
    })();

    const hasMinimumRowNumber = (() => {
      const MINIMUM_ROWS = 15;
      const hasValidRows = jsonRowData.length >= MINIMUM_ROWS;
      if (!hasValidRows) {
        setValidationMessages((prev) => ({
          ...prev,
          hasMinimumRowNumber:
            "There is an insufficient number of 'Day' data, please input a minimum of 15 days of data.",
        }));
      }
      return hasValidRows;
    })();

    const hasEmptyField = (() =>
      jsonRowData.some((row) =>
        currentHeaders.some((col) => {
          const cell = row[col];
          const hasEmpty =
            cell === undefined || String(cell).trim() === "" || cell === null;
          if (hasEmpty) {
            setValidationMessages((prev) => ({
              ...prev,
              hasEmptyFields:
                "Your file contains empty fields/cells, please ensure all fields are filled.",
            }));
          }
          return hasEmpty;
        }),
      ))();

    const hasNonNumericField = (() => {
      const hasNonNumeric = jsonRowData.some((row) =>
        currentHeaders.some((col) => {
          const cell = row[col];
          return isNaN(Number(cell));
        }),
      );

      if (hasNonNumeric) {
        setValidationMessages((prev) => ({
          ...prev,
          hasNonNumericField:
            "Your file contains non-numeric inputs, please ensure all inputs match required units.",
        }));
      }
      return hasNonNumeric;
    })();

    // set file validation state
    const isInvalidFile =
      !hasValidHeaders ||
      hasEmptyField ||
      hasNonNumericField ||
      !hasMinimumRowNumber;

    setForm((prev) => ({
      ...prev,
      fileValidState: isInvalidFile ? "invalid" : "valid",
    }));
    setShowValidationBox(true);
  };

  // helper function for resetting validation messages
  const resetValidationMessages = async () => {
    setValidationMessages({
      hasEmptyFields: "",
      hasNonNumericField: "",
      hasInvalidHeaders: "",
      noFileUploaded: "",
      invalidFileType: "",
      hasMinimumRowNumber: "",
    });
  };

  // Handles fetch calls for BE data upon navigation to next/final step
  const handleGetResults = async () => {
    // increment the steps to get to next page
    nextStep();
    setIsLoadingResults(true);

    // set default forecast day value if no number input
    const DEFAULT_DAYS: string = "20";
    const FORECAST_DAYS: string = formData.forecastDays
      ? formData.forecastDays
      : DEFAULT_DAYS;

    // create POST Body data
    const fileDataToSend = new FormData();
    fileDataToSend.append("file", formData.uploadedFile as File);
    fileDataToSend.append("forecast_day_num", FORECAST_DAYS);
    const llmFormData = new FormData();
    llmFormData.append("file", formData.uploadedFile as File);
    llmFormData.append("crop", formData.crop);

    // settles both fetches simultaneously
    const [graphSettled, llmSettled] = await Promise.allSettled([
      fetch("/data/results", { method: "POST", body: fileDataToSend }).then(
        (res) => {
          if (!res.ok) throw new Error(`Graph request failed: ${res.status}`);
          return res.json() as Promise<GraphResults>;
        },
      ),
      fetch("/data/llm", { method: "POST", body: llmFormData }).then((res) => {
        if (!res.ok) throw new Error(`LLM Request failed: ${res.status}`);
        return res.json() as Promise<UserDataAdvice>;
      }),
    ]);

    // error handle each result separately
    if (graphSettled.status === "fulfilled") {
      setGraphResults(graphSettled.value);
    } else {
      setGraphResults(null);
    }

    if (llmSettled.status === "fulfilled") {
      setLlmResults(llmSettled.value);
    } else {
      setLlmResults(null);
    }

    setIsLoadingResults(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <InputCard>
        <CardHeader className="text-left py-3">
          <div className="flex flex-col p-2 gap-3">
            <CardTitle>
              <p className="text-xs text-left text-grey-subtext">
                {"Upload your filled data file *".toUpperCase()}
              </p>
            </CardTitle>
            <CardDescription className="text-grey-subtext">
              Upload the Excel file you downloaded and filled in. We'll validate
              the format and column structure before running the model.
            </CardDescription>

            <div
              className="flex items-center justify-center border-dashed border-2 border-grey-nonselect
                bg-grey-nonselect/20 rounded-2xl h-fit p-10 mt-6 hover:border-primary-purple hover:cursor-pointer hover:bg-bg-purple"
            >
              <div className="flex flex-col text-center gap-4 items-center hover:cursor-pointer">
                <Folder size={32} color="#99A1AF" className="self-center" />
                <p>Upload your file from your computer</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-md border bg-primary-purple text-bg-white 
                  hover:cursor-pointer hover:scale-105 transition-transform duration-150"
                >
                  Choose file
                </button>
                {formData.uploadedFile && (
                  <p className="text-sm text-primary-purple mt-2">
                    Current File: {formData.uploadedFile.name}
                  </p>
                )}
                <p className="text-xs text-grey-subtext">
                  Accepted: .xlsx, .xls - Max 10MB{" "}
                </p>
                <ValidationBox
                  show={showValidationBox}
                  messages={validationMessage}
                  isValidFile={formData.fileValidState === "valid"}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        {/** Number of days growth to predict - Input field */}
        <div className="flex flex-col gap-3 text-left px-5 mb-6">
          <p className="text-xs text-left text-grey-subtext">
            {"How many days of growth would you like to forecast? *".toUpperCase()}
          </p>
          <p className="text-grey-subtext">
            Provide the number of days of growth you would like to forecast
            starting from the final day of your recorded data.
          </p>
          <Input
            value={formData.forecastDays}
            onChange={handleForecastDayInput}
            type="number"
            min="1"
            placeholder="Input numbers only..."
          />
          {hasInputError && (
            <p className="text-xs text-red-700">
              Please enter a number between 1 and 200
            </p>
          )}
        </div>
      </InputCard>

      {/** Navigation buttons */}
      <div className="flex gap-3">
        <PreviousStepButton text="Back" onClick={prevStep} icon={ArrowLeft} />
        <NextStepButton
          text="Get Results"
          onClick={handleGetResults}
          icon={ArrowRight}
          disabled={formData.fileValidState !== "valid" || hasInputError}
        />
      </div>
    </div>
  );
}

/**
 * Feedback banner displayed after file validation.
 * Shows a green success state on a valid file, or a red error list with
 * individual validation messages on failure.
 *
 * @param show - Whether the box is visible.
 * @param messages - Validation error messages to display when the file is invalid.
 * @param isValidFile - When `true`, shows the success state instead of the error list.
 */
function ValidationBox({ show, messages, isValidFile }: ValidationBoxProps) {
  return (
    <>
      {show && (
        <div
          className={`border-2 rounded-md text-left p-4 ${
            isValidFile
              ? "border-green-400 bg-green-50"
              : "border-red-400 bg-red-50"
          }`}
        >
          <div
            className={`flex items-center gap-2 ${!isValidFile ? "mb-2" : ""}`}
          >
            <p className={`${isValidFile ? "text-green-700" : "text-red-700"}`}>
              {isValidFile
                ? "File validated successfully"
                : "Invalid File Uploaded!"}
            </p>
          </div>

          {!isValidFile &&
            Object.values(messages)
              .filter((msg) => msg !== "")
              .map((msg, id) => (
                <div key={id} className="flex items-center gap-2">
                  {isValidFile ? (
                    <Check className="text-green-600 w-4 h-4" />
                  ) : (
                    <X className="text-red-600 w-4 h-4" />
                  )}
                  <p
                    className={`text-sm ${isValidFile ? "text-green-700" : "text-red-700"}`}
                  >
                    {msg}
                  </p>
                </div>
              ))}
        </div>
      )}
    </>
  );
}

/** Props for the {@link UploadStep} component. */
interface UploadProps {
  nextStep: () => void;
  prevStep: () => void;
}

/** Validation error messages for each check performed on the uploaded Excel file. */
interface ValidationMessages {
  hasEmptyFields: string;
  hasNonNumericField: string;
  hasInvalidHeaders: string;
  noFileUploaded: string;
  invalidFileType: string;
  hasMinimumRowNumber: string;
}

/** Props for the {@link ValidationBox} component. */
interface ValidationBoxProps {
  show: boolean;
  messages: ValidationMessages;
  isValidFile: boolean;
}
