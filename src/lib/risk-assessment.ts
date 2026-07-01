export const RISK_LEVELS = ["Low", "Medium", "High", "Critical"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export type RiskHazardRow = {
  hazard: string;
  whoAtRisk: string;
  riskBefore: string;
  controlMeasures: string;
  riskAfter: string;
};

export type RiskAssessmentData = {
  version: 1;
  preparedDate?: string;
  ppeRequired?: string;
  hazards: RiskHazardRow[];
};

export const HAZARD_SUGGESTIONS = [
  "Slips, trips and falls",
  "Manual handling / lifting",
  "Working at height",
  "Machinery / moving parts",
  "Chemical exposure",
  "Fire / hot surfaces",
  "Electrical hazards",
  "Noise exposure",
  "Vehicle / forklift movement",
  "Flying particles / dust",
];

const RISK_RANK: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function emptyHazardRow(): RiskHazardRow {
  return {
    hazard: "",
    whoAtRisk: "",
    riskBefore: "",
    controlMeasures: "",
    riskAfter: "",
  };
}

export function emptyRiskAssessmentData(): RiskAssessmentData {
  return { version: 1, hazards: [emptyHazardRow()] };
}

export function parseRiskAssessmentControls(
  raw: string | null | undefined
): { type: "structured"; data: RiskAssessmentData } | { type: "legacy"; text: string } {
  if (!raw?.trim()) {
    return { type: "structured", data: emptyRiskAssessmentData() };
  }
  try {
    const parsed = JSON.parse(raw) as RiskAssessmentData;
    if (parsed?.version === 1 && Array.isArray(parsed.hazards)) {
      return {
        type: "structured",
        data: {
          version: 1,
          preparedDate: parsed.preparedDate,
          ppeRequired: parsed.ppeRequired,
          hazards: parsed.hazards.length ? parsed.hazards : [emptyHazardRow()],
        },
      };
    }
  } catch {
    // legacy plain text
  }
  return { type: "legacy", text: raw };
}

export function serializeRiskAssessmentControls(data: RiskAssessmentData): string {
  return JSON.stringify(data);
}

export function highestRiskLevel(levels: string[]): RiskLevel {
  let max = 0;
  let result: RiskLevel = "Low";
  for (const level of levels) {
    const rank = RISK_RANK[level.toLowerCase()] ?? 0;
    if (rank > max) {
      max = rank;
      result = (level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()) as RiskLevel;
      if (!RISK_LEVELS.includes(result)) result = "Medium";
    }
  }
  return result;
}

export function overallRiskFromHazards(hazards: RiskHazardRow[]): RiskLevel {
  const after = hazards.map((h) => h.riskAfter).filter(Boolean);
  if (after.length) return highestRiskLevel(after);
  const before = hazards.map((h) => h.riskBefore).filter(Boolean);
  return before.length ? highestRiskLevel(before) : "Medium";
}

export function formatRiskAssessmentText(data: RiskAssessmentData): string {
  const lines: string[] = [];
  if (data.preparedDate) lines.push(`Date prepared: ${data.preparedDate}`);
  if (data.ppeRequired?.trim()) {
    lines.push(`PPE required: ${data.ppeRequired.trim()}`);
    lines.push("");
  }
  lines.push("HAZARDS AND CONTROLS");
  data.hazards
    .filter((h) => h.hazard.trim() || h.controlMeasures.trim())
    .forEach((h, i) => {
      lines.push(`${i + 1}. ${h.hazard || "Hazard"}`);
      if (h.whoAtRisk.trim()) lines.push(`   Who may be harmed: ${h.whoAtRisk}`);
      if (h.riskBefore) lines.push(`   Risk before controls: ${h.riskBefore}`);
      if (h.controlMeasures.trim()) lines.push(`   Control measures: ${h.controlMeasures}`);
      if (h.riskAfter) lines.push(`   Residual risk: ${h.riskAfter}`);
      lines.push("");
    });
  return lines.join("\n").trim();
}
