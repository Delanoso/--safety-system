import {
  type RiskAssessmentData,
  type RiskHazardRow,
  type RiskLevel,
  overallRiskFromHazards,
  serializeRiskAssessmentControls,
} from "@/lib/risk-assessment";
import {
  buildAssessmentTitle,
  getTemplatePack,
  hazardsFromDescription,
  type HazardTemplate,
} from "@/lib/risk-assessment-templates";

export type GenerateRiskAssessmentInput = {
  industrySector: string;
  assessmentType: string;
  description?: string | null;
};

export type GeneratedRiskAssessment = {
  title: string;
  department: string | null;
  location: string | null;
  riskLevel: RiskLevel;
  controls: string;
  template: RiskAssessmentData;
  industrySector: string;
  assessmentType: string;
  description: string | null;
};

function templateToRow(t: HazardTemplate): RiskHazardRow {
  return {
    hazard: t.hazard,
    whoAtRisk: t.whoAtRisk,
    riskBefore: t.riskBefore,
    controlMeasures: t.controlMeasures,
    riskAfter: t.riskAfter,
  };
}

function mergeHazardRows(...groups: RiskHazardRow[][]): RiskHazardRow[] {
  const seen = new Set<string>();
  const out: RiskHazardRow[] = [];
  for (const group of groups) {
    for (const row of group) {
      const key = row.hazard.toLowerCase().trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(row);
    }
  }
  return out;
}

/**
 * Salus rule-based risk assessment generator (no external AI).
 * Combines assessment-type templates, industry hazards, and keyword matching on description.
 */
export function generateRiskAssessment(
  input: GenerateRiskAssessmentInput
): GeneratedRiskAssessment {
  const industrySector = input.industrySector.trim();
  const assessmentType = input.assessmentType.trim();
  const description = input.description?.trim() || null;

  const pack = getTemplatePack(assessmentType, industrySector);
  const baseRows = pack.hazards.map(templateToRow);
  const industryRows: RiskHazardRow[] = [];
  const keywordRows = hazardsFromDescription(description ?? "").map(templateToRow);

  const hazards = mergeHazardRows(baseRows, industryRows, keywordRows);
  const riskLevel = overallRiskFromHazards(hazards);

  const template: RiskAssessmentData = {
    version: 1,
    preparedDate: new Date().toISOString().split("T")[0],
    ppeRequired: pack.ppeRequired,
    hazards,
  };

  const title = buildAssessmentTitle(pack, assessmentType, industrySector, description);

  let department: string | null = pack.departmentHint ?? null;
  let location: string | null = pack.locationHint ?? null;

  if (description) {
    const deptMatch = description.match(/\bdepartment[:\s]+([^,\n.]+)/i);
    const locMatch = description.match(/\b(location|area|site)[:\s]+([^,\n.]+)/i);
    if (deptMatch?.[1]) department = deptMatch[1].trim();
    if (locMatch?.[2]) location = locMatch[2].trim();
  }

  if (!department && industrySector !== "Other") {
    department = industrySector;
  }

  return {
    title,
    department,
    location,
    riskLevel,
    controls: serializeRiskAssessmentControls(template),
    template,
    industrySector,
    assessmentType,
    description,
  };
}
