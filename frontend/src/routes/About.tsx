import { useState } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import {
  AlertTriangle,
  Droplet,
  Zap,
  Wind,
  Sun,
  ThermometerSun,
  HelpCircle,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

/**
 * About page: explains how GrowLab works, what data powers each model,
 * key growing conditions and FAQs.
 */
export default function About() {
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());

  const toggleFaq = (index: number) => {
    const newOpenFaqs = new Set(openFaqs);
    if (newOpenFaqs.has(index)) {
      newOpenFaqs.delete(index);
    } else {
      newOpenFaqs.add(index);
    }
    setOpenFaqs(newOpenFaqs);
  };

  return (
    <div className="min-h-screen bg-green-50 text-left">
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">How GrowLab Works</h1>
            <p className="text-lg text-gray-600">
              Learn how GrowLab models hydroponic growing conditions using machine learning and environmental data.
            </p>
          </div>

          {/* Disclaimer */}
          <Card className="p-5 mb-6 border-2 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-bold text-amber-900 mb-2">Disclaimer</h2>
                <p className="text-sm text-amber-800 leading-relaxed">
                  GrowLab is an AI-assisted hydroponic analytics platform powered by Google’s Gemini 2.5 Flash model, designed for hobbyist growers and experimentation. Recommendations are provided for informational purposes only and should not replace professional agricultural advice. Always use personal judgement and consult experienced growers before making changes to your setup. You are responsible for all growing decisions and outcomes.
                </p>
              </div>
            </div>
          </Card>

          {/* ML Model Training Data */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Data Powers Our Models?</h2>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              GrowLab uses machine learning models trained on real hydroponic experimental data. Here's what each model learns from:
            </p>

            <div className="space-y-3">
              {models.map((m) => (
                <ModelCard key={m.title} {...m} />
              ))}
            </div>
          </div>

          {/* Key Growing Conditions */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Growing Conditions</h2>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Understand the environmental factors that influence hydroponic growth, nutrient uptake, and yield performance.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {conditions.map((c) => (
                <ConditionCard key={c.title} {...c} />
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <FaqItem
                  key={i}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openFaqs.has(i)}
                  onToggle={() => toggleFaq(i)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

interface ConditionCardProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  typicalRange: string;
  measurement: string;
  units: string;
}

function ConditionCard({ icon: Icon, iconBg, iconColor, title, description, typicalRange, measurement, units }: ConditionCardProps) {
  return (
    <Card className="ring-2 ring-gray-200 bg-bg-white">
      <CardHeader className="text-left pb-0 gap-3">
        <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <p className="text-base font-semibold text-gray-900">{title}</p>
      </CardHeader>
      <CardContent className="text-left flex flex-col gap-3">
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-extrabold underline text-gray-700">Typical range:</span>
            <span className="text-gray-600"> {typicalRange}</span>
          </div>
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-extrabold underline text-gray-700">Usually measured using:</span>
            <span className="text-gray-600"> {measurement}</span>
          </div>
          <div>
            <span className="font-extrabold underline text-gray-700">Units:</span>
            <span className="text-gray-600"> {units}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqItem({ question, answer, isOpen, onToggle }: FaqItemProps) {
  return (
    <Card className="ring-2 ring-gray-200 bg-bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <HelpCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <h4 className="font-semibold text-sm text-gray-900">{question}</h4>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed pt-3">{answer}</p>
        </div>
      )}
    </Card>
  );
}

interface ModelCardProps {
  title: string;
  description: string;
  dataSource: string;
  modelType: string;
}

function ModelCard({ title, description, dataSource, modelType }: ModelCardProps) {
  return (
    <Card className="ring-2 ring-gray-200 bg-bg-white">
      <CardHeader className="text-left pb-0 gap-3">
        <p className="text-base font-semibold text-gray-900">{title} </p>
      </CardHeader>
      <CardContent className="text-left flex flex-col gap-2">
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        <div className="text-xs space-y-1 pt-1">
          <div><span className="font-semibold text-gray-700">Data source:</span><span className="text-gray-600"> {dataSource}</span></div>
          <div><span className="font-semibold text-gray-700">Model type:</span><span className="text-gray-600"> {modelType}</span></div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const models: ModelCardProps[] = [
  {
    title: "Lettuce Model (SimLab)",
    description: "Trained on 3 real hydroponic experiments, each documenting sensor readings, water quality, and harvest weights across multiple growing sessions.",
    dataSource: "Excel spreadsheets from controlled hydroponic experiments, augmented 20× with slight variations to improve model robustness", 
    modelType: "XGBoost regression",
  },
  {
    title: "Cucumber & Tomato Models (SimLab)",
    description: "Pre-trained models based on published hydroponic research datasets. Uses a two-stage prediction system for more accurate yield forecasting.",
    dataSource: "Controlled Environment Agriculture datasets",
    modelType: "Logistic regression (probability) + linear regression (weight) with biological constraints",
  },
  {
    title: "Your Custom Model (YieldIQ)",
    description: "YieldIQ doesn't use pre-trained data, it builds a model from your specific growing history each time you upload data.",
    dataSource: "Your uploaded Excel file with daily recorded measurements",
    modelType: "Linear regression trained on-the-fly from your data",
  },
];

const conditions: ConditionCardProps[] = [
  {
    icon: Droplet,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "pH Level",
    description: "Controls how easily plants absorb nutrients. Incorrect pH can lock out essential nutrients even if they're present.",
    typicalRange: "5.5–6.5 for most hydroponic crops",
    measurement: "Digital pH meter or pH test strips",
    units: "pH scale (0–14)",
  },
  {
    icon: Zap,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    title: "EC (Electrical Conductivity)",
    description: "Indicates nutrient concentration in the water. Too low can cause deficiencies, while too high may stress or burn plants.",
    typicalRange: "0.8–2.5 mS/cm depending on crop and growth stage",
    measurement: "EC/TDS meter probe",
    units: "mS/cm or ppm",
  },
  {
    icon: ThermometerSun,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    title: "Water Temperature",
    description: "Affects root health, oxygen levels, and nutrient uptake. Warmer water holds less oxygen and can increase disease risk.",
    typicalRange: "18–24°C for most hydroponic systems",
    measurement: "Waterproof thermometer probe",
    units: "°C or °F",
  },
  {
    icon: Wind,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    title: "Humidity (RH)",
    description: "Influences transpiration and plant water loss. Poor humidity control can slow growth or encourage mould and disease.",
    typicalRange: "50–70% RH for many indoor crops",
    measurement: "Hygrometer or environmental sensor",
    units: "Relative Humidity (%)",
  },
  {
    icon: Sun,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    title: "Light Hours / DLI",
    description: "Determines how much light energy plants receive for photosynthesis and growth throughout the day.",
    typicalRange: "Varies by crop and growth stage",
    measurement: "Grow light timer, PAR meter, or light sensor",
    units: "Hours/day or mol/m²/day (DLI)",
  },
  {
    icon: Wind,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "CO₂",
    description: "Supports photosynthesis and can improve growth rates when sufficient light and nutrients are available.",
    typicalRange: "400–1200 ppm in controlled environments",
    measurement: "CO₂ monitor or greenhouse sensor",
    units: "ppm",
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Is GrowLab suitable for beginners?",
    a: "Yes! GrowLab is primarily designed for hydroponic hobbyists, especially beginners who are experimenting with growing conditions, optimising their setups, or learning how to grow their first plants. SimLab helps users explore how environmental variables affect plant growth through interactive simulations, while YieldIQ allows more experienced growers to experiment with data-driven forecasting using their own historical growing data.",
  },
  {
    q: "How accurate are the predictions?",
    a: "SimLab uses pre-trained crop models - treat predictions as directional guidance, not exact outcomes. YieldIQ's accuracy depends on your data quality and quantity. Models built from 30+ days of recorded data with varied conditions will be more reliable than those from sparse or inconsistent readings. Always validate predictions against real-world results.",
  },
  {
    q: "What sensors do I need to use GrowLab effectively?",
    a: "For SimLab, the core sensors are pH, EC, CO₂, humidity, and air temperature - these apply to all three crops. Lettuce also uses water temperature and TDS, while tomato and cucumber use DLI (light). For YieldIQ, you choose which variables to track - select at least 3 that are most relevant to your setup, and you're good to go.",
  },
  {
    q: "Why does SimLab recommend different targets when I lock certain variables?",
    a: "When you lock a variable (e.g., you can't control temperature), SimLab's optimisation algorithm adjusts the targets for unlocked variables to compensate. This is called constrained optimisation - finding the best achievable outcome given your limitations.",
  },
  {
    q: "How much historical data do I need for YieldIQ?",
    a: "A minimum of 15 days of recorded data (rows in your spreadsheet) is required, but 30+ days is better. More importantly, your readings should show variation across those days - if every row is identical, the model has nothing to learn from. Data with a range of conditions and outcomes will produce more reliable forecasts.",
  },
  {
    q: "Is my data stored or shared when I upload to YieldIQ?",
    a: "Your uploaded data is sent to our backend server for processing and to Google AI (Gemini) to generate recommendations. We do not permanently store your growing data between sessions; each upload is processed independently. Your data is not sold or shared with third parties beyond the AI provider used for analysis.",
  },
  {
    q: "What should I do if my actual results differ significantly from predictions?",
    a: "First, verify your measurements are accurate and calibrate sensors regularly. Check for factors not captured in the model (pests, diseases, nutrient imbalances beyond EC/pH). Then re-upload an updated dataset that includes your new results. YieldIQ retrains from scratch on every upload, so adding more real-world data, including unexpected outcomes, will improve future forecasts.",
  },
];
