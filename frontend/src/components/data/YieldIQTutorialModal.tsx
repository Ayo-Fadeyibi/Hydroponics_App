import { useRef } from "react";
import { X } from "lucide-react";
import yieldIQVideo from "../Videos/YieldIQ Tute.mp4";

const CHAPTERS = [
  { time: "0:00", seconds: 0,  label: "Welcome to YieldIQ" },
  { time: "0:08", seconds: 8,  label: "Step 1: Enter Crop Name" },
  { time: "0:14", seconds: 14, label: "Step 2: Select Growth Metric" },
  { time: "0:26", seconds: 26, label: "Step 3: Choose Explanatory Variables" },
  { time: "0:42", seconds: 42, label: "Generate & Download Template" },
  { time: "1:00", seconds: 60, label: "Upload Your Data File" },
  { time: "1:08", seconds: 68, label: "Set Your Forecast Range" },
  { time: "1:24", seconds: 84, label: "Get Results" },
  { time: "1:30", seconds: 90, label: "Reading the Growth Forecast Graph" },
  { time: "1:36", seconds: 96, label: "Personalised Recommendations" },
];

/** Props for the {@link YieldIQTutorialModal} component. */
interface YieldIQTutorialModalProps {
  onClose: () => void;
}

export default function YieldIQTutorialModal({ onClose }: YieldIQTutorialModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl flex flex-col w-[90%] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between px-6 pt-4 pb-3">
          <div>
            <h2 className="text-lg text-left font-semibold text-gray-900">
              How to use YieldIQ
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              A quick walkthrough of the features:
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={25} />
          </button>
        </div>

        {/* Video */}
        <div className="flex-shrink-0 relative bg-[#0d1117] w-full h-52 sm:h-60 md:h-68 lg:h-80">
          <video
            ref={videoRef}
            src={yieldIQVideo}
            className="w-full h-full"
            controls
            title="YieldIQ tutorial video"
          />
        </div>

        {/* Chapters */}
        <div className="max-h-48 overflow-y-auto px-6 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 text-left">
            Chapters
          </p>
          <div className="space-y-1">
            {CHAPTERS.map((chapter, i) => (
              <div
                key={i}
                onClick={() => seekTo(chapter.seconds)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="text-xs text-gray-400 w-8 shrink-0">
                  {chapter.time}
                </span>
                <div className="w-2 h-2 rounded-full bg-primary-purple shrink-0" />
                <span className="text-sm text-gray-700 text-left">
                  {chapter.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-2 border-t border-gray-100">
          <span className="text-sm text-gray-400">
            Ready to forecast your yields?
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-primary-purple hover:bg-primary-purple/90 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Get Started
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
