import { useState } from "react";
import { ChevronLeft, Play } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import TutorialModal from "./TutorialModal";

/** Maps crop names to their display emoji, used to derive the icon from the current URL. */
const cropConfig: Record<string, { icon: string }> = {
  Cucumber: { icon: "🥒" },
  Lettuce:  { icon: "🥬" },
  Tomato:   { icon: "🍅" },
};

/**
 * Top navigation bar for the simulation page (`/simulate/<crop>`).
 *
 * Reads the current crop from the URL pathname and displays its icon and
 * name. A back-arrow link returns to the crop-selection screen. A "Tutorial"
 * button opens the {@link TutorialModal} overlay with the walkthrough video.
 */
export default function SimulateHeader() {
  const location = useLocation();
  const path = location.pathname;
  const crop = Object.keys(cropConfig).find((c) => path.endsWith(c)) ?? "Tomato";
  const { icon } = cropConfig[crop];
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between py-6">
        <div className="flex items-center gap-4">
          <Link to="/Simulate" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft size={30} className="text-gray-500" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-5xl">
            {icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base leading-tight">{crop}</p>
          </div>
        </div>

        <button
          onClick={() => setShowTutorial(true)}
          className="flex items-center gap-3 cursor-pointer transition-colors text-green-600 hover:text-green-700 border border-green-600 hover:bg-green-50 text-sm font-medium py-2 px-4 rounded-lg"
        >
          <Play size={14} />
          <span className="text-sm">Tutorial</span>
        </button>
      </div>

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
    </>
  );
}
