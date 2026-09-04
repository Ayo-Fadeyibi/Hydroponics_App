import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart";
import type {
  GraphResponse,
  ComparisonGraphResponse,
} from "../../services/api";

/**
 * Area chart comparing your current yield trajectory against the AI-optimal trajectory.
 *
 * Supports three data modes depending on what `graphData` contains:
 * - **ComparisonGraphResponse** (tomato/cucumber): renders two lines from
 *   `optimal_array` and `current_array` returned by the backend graph endpoint.
 * - **LettuceGraphResponse**: renders a single optimised curve from `growth_curve`.
 * - **Fallback** (no graphData): generates synthetic S-curves on the frontend
 *   using a sigmoid function scaled to `baselineYield` and `optimisedYield`.
 *
 * All weights are converted from grams to kilograms before display. The Y-axis
 * is rounded up to a clean tick ceiling so the chart always has headroom.
 *
 * @param graphData      - Raw response from the `/graph/{crop}` endpoint, or null.
 * @param baselineYield  - User's predicted harvest weight in grams (from `/predict`).
 * @param optimisedYield - AI-optimal yield in grams (from `/optimise`).
 * @param cropIcon       - Emoji shown in the card header.
 * @param daysToHarvest  - X-axis domain used in fallback sigmoid mode.
 */
interface GrowthChartProps {
  graphData?: GraphResponse | null;
  baselineYield: number;
  optimisedYield: number;
  cropIcon?: string;
  daysToHarvest?: number;
}

function isComparison(g: GraphResponse): g is ComparisonGraphResponse {
  return "optimal_array" in g;
}

function generateGrowthCurve(maxYield: number, days: number) {
  const points = [0, 5, 9, 14, 19, 23, 28, 33, 37, 42, 47, 51, 56, 61, 65, 70];
  return points
    .filter((d) => d <= days)
    .map((day) => {
      const t = day / days;
      const sigmoid = 1 / (1 + Math.exp(-10 * (t - 0.55)));
      return { day, yield: parseFloat((maxYield * sigmoid).toFixed(3)) };
    });
}

const chartConfig = {
  baseline: { label: "Your Setup", color: "#9CA3AF" },
  optimised: { label: "Optimized", color: "#7C3AED" },
} satisfies ChartConfig;

export function GrowthChart({
  graphData,
  baselineYield,
  optimisedYield,
  cropIcon = "🍅",
  daysToHarvest = 70,
}: GrowthChartProps) {
  const optimisedKg = parseFloat((optimisedYield / 1000).toFixed(2));
  const baselineKg = Math.min(
    parseFloat((baselineYield / 1000).toFixed(2)),
    optimisedKg,
  );

  const potentialGainText = (() => {
    const pctGain =
      baselineYield == 0
        ? 0
        : Math.round(((optimisedYield - baselineYield) / baselineYield) * 100);
    if (pctGain > 100) {
      return "greater than +100% gain potential";
    }
    return `+${pctGain}% gain potential`;
  })();

  type ChartPoint = {
    day: number;
    baseline: number | null;
    optimised: number | null;
  };
  let chartData: ChartPoint[];
  let maxY: number;
  let days: number;

  if (graphData && isComparison(graphData)) {
    chartData = graphData.optimal_array.map(([day, opt], i) => ({
      day: Math.round(day),
      baseline: parseFloat((graphData.current_array[i][1] / 1000).toFixed(3)),
      optimised: parseFloat((opt / 1000).toFixed(3)),
    }));
    maxY = parseFloat(
      (Math.ceil(graphData.max_growth / 1000 / 0.5) * 0.5).toFixed(2),
    );
    days = graphData.domain;
  } else if (graphData) {
    const maxLen = Math.max(
      graphData.baseline_curve.length,
      graphData.optimised_curve.length,
    );
    chartData = Array.from({ length: maxLen }, (_, i) => {
      const basePoint = graphData.baseline_curve[i];
      const optPoint = graphData.optimised_curve[i];
      return {
        day: basePoint?.[0] ?? optPoint?.[0] ?? i,
        baseline: basePoint
          ? parseFloat((basePoint[1] / 1000).toFixed(3))
          : null,
        optimised: optPoint
          ? parseFloat((optPoint[1] / 1000).toFixed(3))
          : null,
      };
    });
    const maxWeight = Math.max(
      graphData.baseline_curve.at(-1)?.[1] ?? 0,
      graphData.optimised_curve.at(-1)?.[1] ?? 0,
    );
    maxY = parseFloat(
      (Math.ceil(maxWeight / 1000 / 0.05) * 0.05 || 0.5).toFixed(2),
    );
    days = graphData.optimised_curve.at(-1)?.[0] ?? 40;
  } else {
    const bData = generateGrowthCurve(baselineKg, daysToHarvest);
    const oData = generateGrowthCurve(optimisedKg, daysToHarvest);
    const allDays = [
      ...new Set([...bData.map((d) => d.day), ...oData.map((d) => d.day)]),
    ].sort((a, b) => a - b);
    chartData = allDays.map((day) => ({
      day,
      baseline: bData.find((d) => d.day === day)?.yield ?? null,
      optimised: oData.find((d) => d.day === day)?.yield ?? null,
    }));
    maxY = parseFloat((Math.ceil(optimisedKg / 0.15) * 0.15).toFixed(2));
    days = daysToHarvest;
  }

  const hasBaseline = chartData.some((d) => d.baseline !== null);
  const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY].map((v) =>
    parseFloat(v.toFixed(3)),
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 shadow-sm min-h-168 p-6">
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cropIcon}</span>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">
                Growth Timeline Projection
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                {days} days to harvest
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig} className="h-75 w-full">
            <AreaChart
              data={chartData}
              margin={{ left: 16, right: 16, top: 8, bottom: 8 }}
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
                label={{
                  value: "Days",
                  position: "insideBottom",
                  offset: -4,
                  fontSize: 11,
                  fill: "#9CA3AF",
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                ticks={yTicks}
                tickFormatter={(v) => v.toFixed(2)}
                label={{
                  value: "Yield (kg)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 8,
                  fontSize: 11,
                  fill: "#9CA3AF",
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />

              {hasBaseline && (
                <Area
                  dataKey="baseline"
                  type="monotone"
                  stroke="#9CA3AF"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  fill="transparent"
                  dot={false}
                  name="Your Setup"
                />
              )}
              <Area
                dataKey="optimised"
                type="monotone"
                stroke="#7C3AED"
                strokeWidth={2}
                fill="#7C3AED"
                fillOpacity={0.08}
                dot={false}
                name="Optimized"
              />
            </AreaChart>
          </ChartContainer>

          <div className="flex items-center justify-center gap-6 mt-2">
            {hasBaseline && (
              <div className="flex items-center gap-2">
                <svg width="24" height="2">
                  <line
                    x1="0"
                    y1="1"
                    x2="24"
                    y2="1"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                  />
                </svg>
                <span className="text-xs text-gray-500">Your Setup</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <svg width="24" height="2">
                <line
                  x1="0"
                  y1="1"
                  x2="24"
                  y2="1"
                  stroke="#7C3AED"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-xs text-gray-500">Optimized</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border border-gray-100 shadow-sm rounded-2xl p-5">
          <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">
            Baseline
          </p>
          <p className="text-4xl font-semibold text-gray-900">
            {baselineKg.toFixed(2)}kg
          </p>
          <p className="text-xs text-gray-400 mt-1">Your current setup</p>
        </Card>

        <Card className="border border-purple-200 bg-purple-50 shadow-sm rounded-2xl p-5">
          <p className="text-[10px] font-semibold tracking-widest text-purple-400 uppercase mb-2">
            Optimized
          </p>
          <p className="text-4xl font-semibold text-purple-600">
            {optimisedKg.toFixed(2)}kg
          </p>
          <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> {potentialGainText}
          </p>
        </Card>
      </div>
    </div>
  );
}
