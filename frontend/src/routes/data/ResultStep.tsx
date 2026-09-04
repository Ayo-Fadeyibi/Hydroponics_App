import { ArrowLeft, InfoIcon, LeafIcon, TriangleAlert } from "lucide-react";
import LargeButton from "../../components/home/LargeButton";
import { useContext } from "react";
import { FormContext } from "./DataContext";
import InputCard from "../../components/data/InputCard";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  ReferenceLine,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/chart";
import PreviousStepButton from "../../components/data/PreviousStepButton";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/**
 * Step 3 of the YieldIQ — displays the growth forecast chart and
 * LLM-generated personalised recommendations for the uploaded dataset.
 * Shows a loading spinner while results are pending and an error state
 * if graph results are unavailable.
 *
 * @param prevStep - Returns the wizard to the upload step.
 */
export default function ResultStep({ prevStep }: ResultProps) {
  const { formData, graphResults, llmResults, isLoadingResults } =
    useContext(FormContext);

  // Error handle loading and null results states
  if (isLoadingResults)
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2 my-4 text-grey-subtext">
          <DotLottieReact
            src="https://lottie.host/ec84ed77-7163-4b4b-98d1-e008eaa775d5/Ow4CY6Ly2m.lottie"
            loop
            autoplay
            className="w-40"
          />
          <p> Loading... </p>
        </div>
      </div>
    );
  if (!graphResults)
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center text-grey-subtext gap-2 my-4">
          <TriangleAlert size={48} />
          <p> Oops! Something went wrong. </p>
          <p>
            {" "}
            No results currently available. Return to the previous step and try
            again.{" "}
          </p>
        </div>

        <div>
          <LargeButton text="Prev Step" icon={ArrowLeft} onClick={prevStep} />
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-8">
      <InputCard>
        {/** GRAPH HEADER */}
        <CardHeader className="text-left pb-0">
          <div className="flex justify-between items-baseline">
            <div className="flex flex-col p-2 gap-3">
              <CardTitle>
                <p className="text-lg text-left ">
                  {`${formData.crop.trim()} growth forecast`.toUpperCase()}
                </p>
              </CardTitle>
              <CardDescription className="text-grey-subtext italic">
                Based on your recorded data — forecasting{" "}
                {formData.growthMetric} ({getUnits(formData.growthMetric)}).
              </CardDescription>
            </div>
            <div
              className="flex flex-col border-2 border-primary-purple/40
                bg-bg-purple rounded-xl p-2 mr-4 "
            >
              <p className="text-xs text-purple-900">
                Predicted {formData.growthMetric}
              </p>
              <p className="font-display text-2xl font-extrabold text-purple-900">
                {truncateDecimal(graphResults.max_growth)}{" "}
                {formData.growthMetric === "Number of fruit"
                  ? ""
                  : getUnits(formData.growthMetric)}
              </p>
              <p className="text-xs text-purple-900">at end of cycle</p>
            </div>
          </div>
        </CardHeader>

        {/** GRAPH COMPONENT */}
        <GrowthForecastGraph />
      </InputCard>

      {/** LLM RECOMMENDATIONS COMPONENT */}
      {llmResults && <LlmRecommendations />}

      <div className="flex align-baseline">
        <PreviousStepButton text="Back" icon={ArrowLeft} onClick={prevStep} />
      </div>
    </div>
  );
}

/**
 * Area chart visualising recorded and predicted growth data from {@link FormContext}.
 * Merges the recorded and predicted arrays into a single dataset with a
 * "Today" reference line at the last recorded data point.
 */
function GrowthForecastGraph() {
  const { formData, graphResults } = useContext(FormContext);
  if (!graphResults) return <p>No graph results</p>;

  const recordedPoints = graphResults.current_array;
  const predictedPoints = graphResults.optimal_array;
  const todayIndex = recordedPoints.length - 1;

  // merge into single array where each point has either recorded or predicted
  const chartData = [
    ...recordedPoints.slice(0, -1).map((coord) => ({
      day: coord[0],
      recorded: coord[1],
      predicted: null,
    })),
    // overlap at the "today" point so lines connect
    {
      day: predictedPoints[0][0],
      recorded: recordedPoints[todayIndex][1],
      predicted: predictedPoints[0][1],
    },
    ...predictedPoints.slice(1).map((coord) => ({
      day: coord[0],
      recorded: null,
      predicted: coord[1],
    })),
  ];

  const chartConfig = {
    recorded: {
      label: "Recorded",
      color: "#7C3AED",
    },
    predicted: {
      label: "Predicted",
      color: "#A78BFA",
    },
  } satisfies ChartConfig;

  return (
    <div className="mx-6 my-4">
      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <AreaChart
          data={chartData}
          margin={{ left: 0, right: 32, top: 20, bottom: 20 }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="4 4"
            stroke="#E5E7EB"
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            tickFormatter={(val) => `Day ${val}`}
            label={{
              value: "Days",
              position: "insideBottom",
              offset: -18,
              style: { fontSize: 14, fill: "#9CA3AF" },
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            tickFormatter={(val) => `${val}g`}
            label={{
              value: `${formData.growthMetric} (${getUnits(formData.growthMetric)})`,
              angle: -90,
              position: "insideLeft",
              offset: 5,
              style: { fontSize: 14, fill: "#9CA3AF", textAnchor: "middle" },
            }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                indicator="line"
                formatter={(value, name) => [
                  `${truncateDecimal(value as number)}${getUnits(formData.growthMetric)} — `,
                  name === "recorded" ? "Recorded" : "Predicted",
                ]}
              />
            }
          />
          {/* Today reference line */}
          <ReferenceLine
            x={recordedPoints[todayIndex][0]}
            stroke="#7C3AED"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: "Today",
              position: "top",
              fill: "#7C3AED",
              fontSize: 14,
              fontWeight: 800,
            }}
          />
          {/* Recorded data line */}
          <Area
            dataKey="recorded"
            type="monotone"
            stroke="#7C3AED"
            strokeWidth={2}
            fill="transparent"
            dot={(props) => {
              if (props.index === todayIndex) {
                return (
                  <circle
                    key={props.index}
                    cx={props.cx}
                    cy={props.cy}
                    r={5}
                    fill="#7C3AED"
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }
              return <g key={props.index} />;
            }}
            connectNulls={false}
          />
          {/* Predicted data line */}
          <Area
            dataKey="predicted"
            type="monotone"
            stroke="#A78BFA"
            strokeWidth={2}
            strokeDasharray="6 4"
            fill="transparent"
            dot={(props) => {
              const lastIndex = chartData.length - 1;
              if (props.index === lastIndex) {
                return (
                  <circle
                    key={props.index}
                    cx={props.cx}
                    cy={props.cy}
                    r={5}
                    fill="#A78BFA"
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }
              return <g key={props.index} />;
            }}
            connectNulls={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

/**
 * Card displaying LLM-generated personalised recommendations from {@link FormContext}.
 * Renders general advice, the most influential variable, and per-variable advice
 * when each field is present in the LLM results.
 */
function LlmRecommendations() {
  const { llmResults } = useContext(FormContext);

  return (
    <InputCard>
      {" "}
      <CardHeader className="text-left pb-0">
        <div className="flex flex-col p-2 gap-3">
          <CardTitle>
            <p className="text-md text-left ">
              {"personalised recommendations".toUpperCase()}
            </p>
          </CardTitle>
          <CardDescription className="text-grey-subtext italic">
            Based on patterns on your crop growth history.
          </CardDescription>
          <div>
            {llmResults?.general_advice && (
              <section className="mb-6">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
                  General advice
                </p>
                <div className="flex gap-3.5 items-center bg-zinc-50 border border-zinc-200 rounded-xl px-6 py-5">
                  <div className="w-9 h-9 rounded-full  bg-blue-50 flex items-center justify-center shrink-0">
                    <InfoIcon className="w-[18px] h-[18px] text-blue-700" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {llmResults.general_advice}
                  </p>
                </div>
              </section>
            )}
            {llmResults?.strongest_feature && (
              <section className="mb-6">
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
                  Most Influential Explanatory Variable
                </p>
                <div className="border-l-[3px] border-l-emerald-500 border border-zinc-200 rounded-r-md bg-zinc-50 px-5 py-4">
                  <p className="text-sm leading-relaxed text-foreground">
                    {llmResults.strongest_feature}
                  </p>
                </div>
              </section>
            )}
            {llmResults?.advice_per_feature &&
              llmResults?.advice_per_feature?.length > 0 && (
                <section className="mb-6">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
                    Advice for each Explanatory Variable
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {llmResults.advice_per_feature.map((advice, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 items-start bg-zinc-50 border border-zinc-200 rounded-lg px-5 py-4"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                          <LeafIcon className="w-4 h-4 text-emerald-800" />
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">
                          {advice}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </div>
        </div>
      </CardHeader>
    </InputCard>
  );
}

// UTIL FUNCTIONS

/**
 * Truncates a number to the given number of decimal places without rounding.
 *
 * @param num - The number to truncate.
 * @param places - Decimal places to keep (default: 2).
 */
function truncateDecimal(num: number, places: number = 2) {
  const factor = Math.pow(10, places);
  return Math.trunc(num * factor) / factor;
}

/**
 * Returns the display unit string for a given growth metric.
 *
 * @param growthMetric - The selected growth metric name.
 * @returns The unit string (e.g. "g", "cm", "quantity"), or an empty string if unrecognised.
 */
const getUnits = (growthMetric: string) => {
  switch (growthMetric) {
    case "Yield Weight":
      return "g";
    case "Plant Height":
      return "cm";
    case "Number of fruit":
      return "quantity";
    default:
      return "";
  }
};

/** Props for the {@link ResultStep} component. */
interface ResultProps {
  prevStep: () => void;
}
