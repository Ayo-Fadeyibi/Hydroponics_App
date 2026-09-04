import { Workbook } from "exceljs";
import type { FormData } from "./DataContext";

/**
 * Returns the formatted column header string for the given growth metric,
 * appending the appropriate unit suffix (e.g. "(g)", "(cm)", "(quantity)").
 *
 * @param growthMetric - The selected growth metric name.
 * @returns The formatted column header string.
 */
export const getGrowthMetricHeader = (growthMetric: string) => {
  switch (growthMetric) {
    case "Yield Weight":
      return "Yield Weight (g)";
    case "Plant Height":
      return "Plant Height (cm)";
    case "Number of fruit":
      return "Number of fruit (quantity)";
    default:
      return growthMetric;
  }
};

/**
 * Generates and triggers a browser download of a pre-formatted Excel (.xlsx)
 * data template based on the user's form selections.
 * The workbook includes instruction comment rows, a bold header row with the
 * selected metric and variable columns, and 50 pre-filled day rows.
 *
 * @param formData - Wizard form data containing crop name, growth metric, and selected variables.
 */
export async function generateExcel({
  crop,
  growthMetric,
  selectedExpVariables,
}: FormData) {
  const GROWTH_METRIC_HEADER = getGrowthMetricHeader(growthMetric);
  const CROP_NAME =
    `${crop.charAt(0).toUpperCase() + crop.slice(1).toLowerCase()}`.trim();
  const DAY_ONE = 1;
  const FINAL_DAY = 50;

  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet(CROP_NAME);

  // Define columns without headers so instructions can go first
  worksheet.columns = [
    { key: "day", width: 10 },
    { key: "metric", width: 30 },
    ...[...selectedExpVariables].map((variable) => ({
      key: variable.toLowerCase().replace(/\s+/g, "_"),
      width: 25,
    })),
  ];

  // Add instruction comment rows above the column headers
  dataInstructions.forEach((instruction) => {
    const row = worksheet.addRow([instruction]);
    row.getCell(1).font = { italic: true, color: { argb: "FF808080" } };
  });

  // add row space between comments and data
  worksheet.addRow([]);

  // Add header row
  const headerRow = worksheet.addRow([
    "Days",
    GROWTH_METRIC_HEADER,
    ...[...selectedExpVariables],
  ]);
  headerRow.font = { bold: true };

  // Pre-fill 50 day rows
  for (let day = DAY_ONE; day <= FINAL_DAY; day++) {
    worksheet.addRow({ day });
  }

  // Write the workbook to buffer - to be downloaded in browser
  const buffer = await workbook.xlsx.writeBuffer();
  // create a blob of the buffer
  const blob = new Blob([buffer], { type: "application/octet-stream" });

  // create a temporary url for the blob
  const url = URL.createObjectURL(blob);

  // create a temporary invisible anchor element in DOM that triggers browser download
  const a = document.createElement("a");
  a.href = url;
  a.download = `${CROP_NAME}_data_template.xlsx`;
  document.body.append(a);
  a.click();

  // cleanup dom
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const dataInstructions: string[] = [
  "# YieldIQ Data Template",
  "# Fill in your real values below.",
  "# Do not change column headers.",
  "# Minimum 15 rows/days recommended for reliable predictions.",
  "# Add or remove rows to increase or decrease days of data (if required).",
];
