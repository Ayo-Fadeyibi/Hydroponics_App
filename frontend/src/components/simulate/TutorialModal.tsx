import { useRef } from "react";
import { X } from "lucide-react";
import simlabVideo from "../Videos/Simlab Tutorial.mp4";

const CHAPTERS = [
  { time: "0:00", seconds: 0,  label: "Welcome to Simlab" },
  { time: "0:13", seconds: 13, label: "Adjust the Sliders (Environmental Conditions)" },
  { time: "0:23", seconds: 23, label: "Running the Simulation" },
  { time: "0:28", seconds: 28, label: "Condition Check Table" },
  { time: "0:39", seconds: 39, label: "Improving Your Setup" },
  { time: "0:46", seconds: 46, label: "Apply AI Optimised Settings" },
  { time: "0:56", seconds: 56, label: "Locking Fixed Values" },
  { time: "1:11", seconds: 71, label: "Growth Projection: Your Setup vs AI Optimised" },
  { time: "1:24", seconds: 84, label: "Optimisation Report & Tooltips" },
];

/** Props for the {@link TutorialModal} component. */
interface TutorialModalProps {
  onClose: () => void;
}

/**
 * Compact tutorial modal with an embedded YouTube video and chapter navigation.
 *
 * @param onClose - Callback invoked when the user dismisses the modal.
 */
export default function TutorialModal({ onClose }: TutorialModalProps) {
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
        {/* Header — stays at top */}
        <div className="flex-shrink-0 flex items-start justify-between px-6 pt-4 pb-3">
          <div>
            <h2 className="text-lg text-left font-semibold text-gray-900">
              How to use SimLab
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              A quick walkthrough the features:
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={25} />
          </button>
        </div>

        {/* Video — stays at top */}
        <div className="flex-shrink-0 relative bg-[#0d1117] w-full h-52 sm:h-60 md:h-68 lg:h-80">
          <video
            ref={videoRef}
            src={simlabVideo}
            className="w-full h-full"
            controls
            title="Tutorial video"
          />
        </div>

        {/* Chapters — only this section scrolls */}
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
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm text-gray-700 text-left">
                  {chapter.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer — stays at bottom */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-2 border-t border-gray-100">
          <span className="text-sm text-gray-400">
            Ready to try it yourself?
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            Start Simulation
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
