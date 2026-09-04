import { Sparkles, TrendingUp } from "lucide-react";
import type { OptimisationData, LLMAdvice } from "../../services/api";

/**
 * AI Optimisation Report card shown in the "Optimisation Report" tab.
 *
 * Displays the optimal yield, percentage gain over the user's current setup,
 * and LLM-generated advice (action steps, urgency score, status badge).
 * While the LLM call is in-flight a spinner is shown; once resolved the
 * structured advice replaces the placeholder summary.
 *
 * Yield gain is computed as: `((optimal_yield - current_yield) / current_yield) * 100`.
 *
 * @param cropName         - Crop name used in placeholder text (e.g. "tomato").
 * @param optimisationData - Response from the `/optimise/{crop}` endpoint.
 * @param currentYield     - User's predicted harvest weight in grams.
 * @param llmAdvice        - Structured advice from the `/llm/{crop}` endpoint, or null.
 * @param isLoadingLLM     - True while the LLM request is pending.
 */
interface Props {
  cropName?: string;
  optimisationData: OptimisationData;
  currentYield?: number;
  llmAdvice?: LLMAdvice | null;
  isLoadingLLM?: boolean;
}

export default function OptimisationReport({
  cropName = "your",
  optimisationData,
  currentYield,
  llmAdvice,
  isLoadingLLM,
}: Props) {
  const optimalYield = Math.round(optimisationData.optimal_yield);

  const yieldGain =
    currentYield && currentYield > 0
      ? Math.round(
          ((optimisationData.optimal_yield - currentYield) / currentYield) *
            100,
        )
      : null;

  const potentialGainText = (() => {
    if (yieldGain == null) return "";
    if (yieldGain > 100) {
      return "greater than +100% gain potential";
    }
    return `+${yieldGain}% gain potential`;
  })();

  return (
    <div className="w-full bg-linear-to-r from-purple-600 to-purple-500 rounded-2xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-400/50 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <p className="text-white font-semibold text-base">
            AI Optimisation Report
          </p>
        </div>
      </div>

      {/* LLM Summary */}
      <div className="bg-purple-400/30 rounded-xl p-4 flex flex-col gap-2">
        <p className="text-purple-200 text-xs font-medium uppercase tracking-widest">
          AI Assessment
        </p>
        {isLoadingLLM && !llmAdvice ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-purple-300 border-t-transparent animate-spin" />
            <p className="text-purple-200 text-xs">Generating AI advice…</p>
          </div>
        ) : llmAdvice ? (
          <>
            <p className="text-white text-sm leading-relaxed">
              {llmAdvice.advice_summary}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-purple-200 text-[10px]">Urgency:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-1.5 rounded-sm ${i < llmAdvice.priority_score ? "bg-white" : "bg-purple-400/40"}`}
                  />
                ))}
              </div>
              <span className="text-purple-200 text-[10px]">
                {llmAdvice.priority_score}/10
              </span>
            </div>
          </>
        ) : (
          <p className="text-purple-200 text-sm">
            Your {cropName} setup could yield approximately{" "}
            <span className="font-semibold text-white">{optimalYield}g</span>{" "}
            under optimal conditions
            {yieldGain !== null && yieldGain > 0
              ? ` — a ${Math.min(yieldGain, 100)}% improvement.`
              : "."}
          </p>
        )}
      </div>

      {/* Action Steps from LLM */}
      {llmAdvice && llmAdvice.action_steps.length > 0 && (
        <div className="bg-purple-400/30 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-white text-sm font-semibold">
            Recommended Actions
          </p>
          <ul className="flex flex-col gap-2">
            {llmAdvice.action_steps.map((step, i) => (
              <li
                key={i}
                className="text-purple-100 text-xs flex items-start gap-2"
              >
                <span className="shrink-0 w-4 h-4 rounded-full bg-purple-400/50 flex items-center justify-center text-[9px] font-bold text-white mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Yield outcome */}
      {yieldGain !== null && yieldGain > 0 && (
        <div className="bg-purple-400/30 rounded-xl p-4 flex items-center gap-3">
          <TrendingUp size={16} className="text-white shrink-0" />
          <p className="text-purple-100 text-xs">
            <span className="font-semibold text-white">
              {potentialGainText}
            </span>
            {"  "}({currentYield ? Math.round(currentYield) : "—"}g →{" "}
            {optimalYield}g)
          </p>
        </div>
      )}
    </div>
  );
}
