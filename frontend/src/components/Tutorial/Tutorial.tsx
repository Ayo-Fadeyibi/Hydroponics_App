import { X, Sparkles, Sun, TrendingUp, Play, Check } from "lucide-react";
import { createPortal } from "react-dom";

/** Props for the {@link Tutorial} component. */
interface Props {
  onClose: () => void;
}

/**
 * Full SimLab workflow tutorial rendered as a portal overlay.
 * Covers an overview, feature highlights, an embedded walkthrough video.
 *
 * @param onClose - Callback invoked when the user closes the modal.
 */
export default function Tutorial({ onClose }: Props) {
  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">
            SimLab Complete Workflow Guide
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-8">
          {/* Three info cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-800">Overview</p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                SimLab is an AI-powered environmental simulation platform that
                predicts plant growth outcomes based on your hydroponic setup
                parameters.
              </p>
              <ul className="flex flex-col gap-1.5">
                {[
                  "Test unlimited configurations risk-free",
                  "Get AI-optimized recommendations",
                  "Predict yield and harvest timeline",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <Check
                      size={11}
                      className="text-green-500 mt-0.5 shrink-0"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                  <Sun size={14} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  SimLab Features
                </p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Two powerful tools: Calculate growth projections for any setup,
                or get optimal recommendations within your constraints.
              </p>
              <ul className="flex flex-col gap-1.5">
                {[
                  {
                    icon: <Play size={10} className="text-green-500" />,
                    text: "Calculate Growth: Test any configuration",
                  },
                  {
                    icon: <Sparkles size={10} className="text-purple-500" />,
                    text: "Calculate Optimal: Get AI values for your constraints",
                  },
                  {
                    icon: <TrendingUp size={10} className="text-blue-500" />,
                    text: "View growth animations and yield projections",
                  },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <span className="mt-0.5 shrink-0">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center shrink-0">
                  <TrendingUp size={14} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  Results & Insights
                </p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                View comprehensive growth projections with animated plant
                lifecycle visualisation and performance metrics.
              </p>
              <ul className="flex flex-col gap-1.5">
                {[
                  {
                    sym: "↑",
                    color: "text-green-500",
                    text: "Projected yield in kilograms",
                  },
                  {
                    sym: "↓",
                    color: "text-orange-500",
                    text: "Days to harvest estimation",
                  },
                  {
                    sym: "✦",
                    color: "text-purple-500",
                    text: "Growth score percentage (0–100%)",
                  },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <span className={`${item.color} font-bold shrink-0`}>
                      {item.sym}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Video section */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-semibold text-gray-900">
                See SimLab in Action
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Watch a quick walkthrough of the platform's key features
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <iframe
                width="100%"
                height="280"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="SimLab Walkthrough"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="block"
              />
            </div>
          </div>

          {/* Step-by-step workflow */}
          <div className="flex flex-col gap-4">
            <p className="font-semibold text-gray-900">Step-by-Step Workflow</p>

            {/* Workflow chooser */}
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/40 flex flex-col gap-3">
              <p className="text-sm font-medium text-blue-700">
                Choose Your Workflow:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Play size={12} className="text-green-500" />
                    <p className="text-sm font-medium text-gray-800">
                      Calculate Growth
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Test specific configurations and see growth projections with
                    animated plant lifecycle
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-purple-500" />
                    <p className="text-sm font-medium text-gray-800">
                      Calculate Optimal Conditions
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Lock your real-world constraints and get AI-optimized values
                    for remaining parameters
                  </p>
                </div>
              </div>
            </div>

            {/* Two-column steps */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left: Calculate Growth */}
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                  <Play size={12} /> Calculate Growth Workflow
                </p>
                {[
                  {
                    num: "1",
                    title: "Adjust environmental controls",
                    context: "Use the sliders to configure your setup:",
                    bullets: [
                      "Adjust pH, EC, temperature, humidity, light hours, CO₂",
                      "Set values to match your current or planned configuration",
                      "Click the ⓘ icon on each slider to learn what it does",
                    ],
                  },
                  {
                    num: "2",
                    title: "Calculate and view results",
                    context: null,
                    bullets: [
                      'Click "Simulate Growth" to run the simulation',
                      "View animated plant lifecycle with growth stages",
                      "See projected yield (kg) in the Growth Chart tab",
                      "Check growth score percentage (0–100%) on the plant panel",
                    ],
                  },
                  {
                    num: "3",
                    title: "Compare scenarios",
                    context: null,
                    bullets: [
                      'Switch to the "Growth Chart" tab',
                      "View baseline vs optimised yield curve",
                      "See potential yield improvements with optimisation",
                    ],
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="border border-gray-200 rounded-xl p-3 flex flex-col gap-1.5"
                  >
                    <p className="text-xs font-semibold text-gray-700">
                      {step.num}. {step.title}
                    </p>
                    {step.context && (
                      <p className="text-xs text-gray-500">{step.context}</p>
                    )}
                    <ul className="flex flex-col gap-1">
                      {step.bullets.map((b) => (
                        <li
                          key={b}
                          className="text-xs text-gray-500 flex items-start gap-1.5"
                        >
                          <span className="shrink-0 mt-0.5">•</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Right: Calculate Optimal */}
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-purple-600 flex items-center gap-1.5">
                  <Sparkles size={12} /> Calculate Optimal Conditions Workflow
                </p>
                {[
                  {
                    title: "Step 1: Select constraints",
                    context: "Lock sliders you can't change:",
                    bullets: [
                      "Toggle the lock switch on parameters you cannot change",
                      "These represent real-world limitations (equipment, space, budget)",
                      "Leave unlocked any parameters you can freely control",
                    ],
                  },
                  {
                    title: "Step 2: Set constraint values",
                    context: "Adjust the locked sliders:",
                    bullets: [
                      "Move each locked slider to your actual fixed value",
                      "These values will not be changed by the optimiser",
                    ],
                  },
                  {
                    title: "Step 3: Get optimal values",
                    context: "Run the simulation:",
                    bullets: [
                      'Click "Simulate Growth" to run AI optimisation',
                      "Open the Optimisation Report tab to see recommended settings",
                      'Click "Apply AI Optimised Settings" to update your sliders',
                      "Adjust constraints and re-run to explore different scenarios",
                    ],
                  },
                ].map((step) => (
                  <div
                    key={step.title}
                    className="border border-gray-200 rounded-xl p-3 flex flex-col gap-1.5"
                  >
                    <p className="text-xs font-semibold text-gray-700">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.context}</p>
                    <ul className="flex flex-col gap-1">
                      {step.bullets.map((b) => (
                        <li
                          key={b}
                          className="text-xs text-gray-500 flex items-start gap-1.5"
                        >
                          <span className="shrink-0 mt-0.5">•</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
