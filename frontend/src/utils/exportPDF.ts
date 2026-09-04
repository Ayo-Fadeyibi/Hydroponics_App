import jsPDF from "jspdf";
import type { SensorConfig } from "../components/VariableSliders/SensorRow";
import type { OptimisationData, LLMAdvice } from "../services/api";

export interface ExportPDFData {
  crop: string;
  sensors: SensorConfig[];
  predictionYield: number;
  optimisationData: OptimisationData;
  userHealthScore: number;
  optimalHealthScore: number;
  llmAdvice: LLMAdvice | null;
}

/** Strips characters jsPDF cannot render (emoji, subscripts, etc.) */
function safe(text: string): string {
  return text
    .split("")
    .filter((ch) => ch.charCodeAt(0) < 128)
    .join("")
    .replace("CO2", "CO2");
}

/** Pre-replace known special labels before safe() strips them */
function safeLabel(label: string): string {
  return safe(label.replace("CO₂", "CO2"));
}

const C = {
  green:    [34, 197, 94]   as const,
  greenDk:  [22, 163, 74]   as const,
  greenBg:  [240, 253, 244] as const,
  purple:   [124, 58, 237]  as const,
  purpleBg: [245, 243, 255] as const,
  dark:     [17, 24, 39]    as const,
  mid:      [75, 85, 99]    as const,
  muted:    [156, 163, 175] as const,
  border:   [229, 231, 235] as const,
  rowAlt:   [249, 250, 251] as const,
  white:    [255, 255, 255] as const,
  red:      [220, 38, 38]   as const,
  pipOff:   [167, 139, 250] as const,
};

type RGB = readonly [number, number, number];

function fill(doc: jsPDF, rgb: RGB) { doc.setFillColor(...rgb); }
function stroke(doc: jsPDF, rgb: RGB) { doc.setDrawColor(...rgb); }
function text(doc: jsPDF, rgb: RGB) { doc.setTextColor(...rgb); }

function drawBar(doc: jsPDF, x: number, y: number, w: number, h: number, score: number, color: RGB) {
  fill(doc, C.border);
  doc.roundedRect(x, y, w, h, h / 2, h / 2, "F");
  fill(doc, color);
  doc.roundedRect(x, y, Math.max((score / 99) * w, h), h, h / 2, h / 2, "F");
}

function scoreColor(score: number): RGB {
  if (score >= 70) return C.green;
  if (score >= 40) return [234, 179, 8] as const;
  return C.red;
}

export function exportSimulationPDF(data: ExportPDFData) {
  const { crop, sensors, predictionYield, optimisationData, userHealthScore, optimalHealthScore, llmAdvice } = data;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PW = 210;
  const M = 16;
  const CW = PW - M * 2;
  const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  const cropName = crop.charAt(0).toUpperCase() + crop.slice(1);

  // ── Header ──────────────────────────────────────────────────────────────────
  fill(doc, C.green);
  doc.rect(0, 0, PW, 32, "F");

  fill(doc, C.greenDk);
  doc.triangle(PW - 60, 0, PW, 0, PW, 32, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  text(doc, C.white);
  doc.text("GrowLab", M, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 252, 231);
  doc.text("Hydroponics Simulation Report", M, 21);
  doc.text(date, M, 27);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  text(doc, C.white);
  doc.text(cropName, PW - M, 19, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 252, 231);
  doc.text("Simulated Crop", PW - M, 26, { align: "right" });

  let y = 42;

  // ── Health Scores ────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  text(doc, C.dark);
  doc.text("HEALTH SCORES", M, y);
  stroke(doc, C.border);
  doc.setLineWidth(0.1);
  doc.line(M + 40, y - 1, M + CW, y - 1);
  y += 5;

  const bw = (CW - 5) / 2;

  const drawScoreCard = (x: number, label: string, score: number, color: RGB, bgColor: RGB) => {
    fill(doc, bgColor);
    doc.roundedRect(x, y, bw, 26, 3, 3, "F");
    fill(doc, color);
    doc.roundedRect(x, y, bw, 5, 3, 3, "F");
    doc.rect(x, y + 2, bw, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    text(doc, C.white);
    doc.text(label, x + 3, y + 3.8);
    doc.setFontSize(22);
    text(doc, C.dark);
    doc.text(`${score}`, x + 3, y + 17);
    const scoreWidth = doc.getTextWidth(`${score}`);
    doc.setFontSize(10);
    text(doc, C.mid);
    doc.text("/ 99", x + 3 + scoreWidth + 2, y + 17);
    drawBar(doc, x + 3, y + 20, bw - 6, 3, score, color);
  };

  drawScoreCard(M, "YOUR SCORE", userHealthScore, scoreColor(userHealthScore), C.greenBg);
  drawScoreCard(M + bw + 5, "OPTIMAL SCORE", optimalHealthScore, C.purple, C.purpleBg);

  y += 34;

  // ── Yield Comparison ─────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  text(doc, C.dark);
  doc.text("YIELD COMPARISON", M, y);
  stroke(doc, C.border);
  doc.line(M + 45, y - 1, M + CW, y - 1);
  y += 5;

  const optYield = Math.round(optimisationData.optimal_yield);
  const curYield = Math.round(predictionYield);
  const gain = curYield > 0 ? Math.round(((optYield - curYield) / curYield) * 100) : null;
  const thirdW = (CW - 10) / 3;

  fill(doc, C.border);
  doc.roundedRect(M, y, thirdW, 18, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  text(doc, C.muted);
  doc.text("Current Yield", M + 3, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  text(doc, C.dark);
  doc.text(`${curYield}g`, M + 3, y + 14);

  doc.setFontSize(14);
  text(doc, C.muted);
  doc.text("->", M + thirdW + 2, y + 11);

  const oy2 = M + thirdW + 10;
  fill(doc, C.greenBg);
  doc.roundedRect(oy2, y, thirdW, 18, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  text(doc, C.green);
  doc.text("Optimal Yield", oy2 + 3, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  text(doc, C.dark);
  doc.text(`${optYield}g`, oy2 + 3, y + 14);

  if (gain !== null && gain > 0) {
    const gx = M + thirdW * 2 + 12;
    fill(doc, C.green);
    doc.roundedRect(gx, y + 2, thirdW - 4, 14, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    text(doc, C.white);
    doc.text(`+${Math.min(gain, 100)}%`, gx + (thirdW - 4) / 2, y + 11, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("potential gain", gx + (thirdW - 4) / 2, y + 15, { align: "center" });
  }

  y += 26;

  // ── Environment Settings ──────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  text(doc, C.dark);
  doc.text("ENVIRONMENT SETTINGS", M, y);
  stroke(doc, C.border);
  doc.line(M + 53, y - 1, M + CW, y - 1);
  y += 4;

  const optimal = optimisationData.optimal_environment as Record<string, number>;
  const cols = [CW * 0.37, CW * 0.21, CW * 0.21, CW * 0.21];
  const rh = 7.5;

  fill(doc, C.dark);
  doc.roundedRect(M, y, CW, rh, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  text(doc, C.white);
  let cx = M + 3;
  ["Sensor", "Current Value", "Optimal Value", "Difference"].forEach((h, i) => {
    doc.text(h, i === 0 ? cx : cx + cols[i] / 2, y + 5, { align: i === 0 ? "left" : "center" });
    cx += cols[i];
  });
  y += rh;

  sensors.forEach((s, idx) => {
    const optVal = optimal[s.key];
    const diff = optVal != null ? Math.round((optVal - s.value) * 10) / 10 : null;

    fill(doc, idx % 2 === 0 ? C.white : C.rowAlt);
    doc.rect(M, y, CW, rh, "F");

    fill(doc, s.locked ? C.purple : C.green);
    doc.rect(M, y, 1.5, rh, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    text(doc, C.dark);
    cx = M + 4.5;
    doc.text(safeLabel(s.label), cx, y + 5);
    cx += cols[0];

    doc.text(`${s.value}${s.unit}`, cx + cols[1] / 2, y + 5, { align: "center" });
    cx += cols[1];
    doc.text(optVal != null ? `${Math.round(optVal * 10) / 10}${s.unit}` : "--", cx + cols[2] / 2, y + 5, { align: "center" });
    cx += cols[2];

    if (diff !== null && diff !== 0) {
      text(doc, diff > 0 ? C.green : C.red);
      doc.setFont("helvetica", "bold");
      doc.text(`${diff > 0 ? "+" : ""}${diff}`, cx + cols[3] / 2, y + 5, { align: "center" });
    } else {
      text(doc, C.muted);
      doc.text("--", cx + cols[3] / 2, y + 5, { align: "center" });
    }

    stroke(doc, C.border);
    doc.setLineWidth(0.1);
    doc.line(M, y + rh, M + CW, y + rh);
    y += rh;
  });

  y += 8;

  // ── AI Advice ────────────────────────────────────────────────────────────────
  if (llmAdvice) {
    if (y > 220) { doc.addPage(); y = 20; }

    fill(doc, C.purple);
    doc.roundedRect(M, y, CW, 7, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    text(doc, C.white);
    doc.text("AI OPTIMISATION ADVICE", M + 3, y + 4.8);

    // Urgency pips on header right side
    const score = llmAdvice.priority_score;
    for (let i = 0; i < 10; i++) {
      fill(doc, i < score ? C.white : C.pipOff);
      doc.circle(M + CW - 40 + i * 4, y + 3.5, 1.2, "F");
    }

    y += 11;

    const summaryLines = doc.splitTextToSize(safe(llmAdvice.advice_summary), CW - 8);
    const summaryH = summaryLines.length * 5 + 8;
    fill(doc, C.purpleBg);
    doc.roundedRect(M, y, CW, summaryH, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    text(doc, C.dark);
    doc.text(summaryLines, M + 4, y + 6);
    y += summaryH + 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    text(doc, C.mid);
    doc.text(`Urgency: ${score}/10`, M, y);
    y += 7;

    if (llmAdvice.action_steps.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      text(doc, C.dark);
      doc.text("Recommended Actions", M, y);
      y += 5;

      llmAdvice.action_steps.forEach((step, i) => {
        if (y > 265) { doc.addPage(); y = 20; }
        const lines = doc.splitTextToSize(safe(step), CW - 14);
        fill(doc, C.purple);
        doc.circle(M + 3, y + 3, 3, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        text(doc, C.white);
        doc.text(`${i + 1}`, M + 3, y + 4.5, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        text(doc, C.dark);
        doc.text(lines, M + 9, y + 4);
        y += lines.length * 5 + 4;
      });
    }
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    fill(doc, C.border);
    doc.rect(0, 284, PW, 13, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    text(doc, C.muted);
    doc.text("Generated by GrowLab  |  Hydroponics Simulation Platform", M, 291);
    doc.text(`Page ${p} of ${total}`, PW - M, 291, { align: "right" });
  }

  doc.save(`growlab-${crop}-report.pdf`);
}