import type { ComplianceStatus } from "@/lib/legal-compliance";

export type AuditTemplateItem = {
  auditRef: string;
  section: string;
  subsection: string;
  requirement: string;
  legislation: string;
  appliesTo: string;
  weight: number | null;
  achieved: string | null;
  score: number | null;
  observations: string | null;
  status: ComplianceStatus;
};

export type ParsedAuditRow = AuditTemplateItem;

export function mapLegislationFromAudit(
  section: string,
  subsection: string,
  question: string
): string {
  const hay = `${section} ${subsection} ${question}`.toLowerCase();
  if (hay.includes("coid") || hay.includes("compensation for injuries")) {
    return "Compensation for Occupational Injuries and Diseases Act (COIDA)";
  }
  if (hay.includes("16.2") || hay.includes("section 16")) {
    return "Occupational Health and Safety Act 85 of 1993 (OHSA)";
  }
  if (hay.includes("she rep") || hay.includes("she committee") || hay.includes("committee")) {
    return "Occupational Health and Safety Act 85 of 1993 (OHSA)";
  }
  if (hay.includes("risk assessment") || hay.includes("hazardous substance")) {
    return "General Safety Regulations (GSR)";
  }
  if (hay.includes("lifting machine") || hay.includes("lmi") || hay.includes("gmr")) {
    return "General Machinery Regulations (GMR)";
  }
  if (hay.includes("electrical")) {
    return "Electrical Installation Regulations";
  }
  if (hay.includes("environmental") || hay.includes("pollution") || hay.includes("nema")) {
    return "National Environmental Management Act (NEMA)";
  }
  if (hay.includes("contractor") || hay.includes("37.2")) {
    return "Occupational Health and Safety Act 85 of 1993 (OHSA)";
  }
  if (hay.includes("incident") || hay.includes("investigation")) {
    return "General Administrative Regulations (GAR)";
  }
  if (hay.includes("fire") || hay.includes("emergency")) {
    return "General Safety Regulations (GSR)";
  }
  if (hay.includes("first aid")) {
    return "General Safety Regulations (GSR)";
  }
  if (hay.includes("induction") || hay.includes("training")) {
    return "Occupational Health and Safety Act 85 of 1993 (OHSA)";
  }
  if (subsection.startsWith("2.2")) {
    return "Occupational Health and Safety Act 85 of 1993 (OHSA)";
  }
  return "Salus HSE Audit Checklist";
}

function statusFromAchieved(
  achievedRaw: string,
  weight: number | null
): ComplianceStatus {
  if (!achievedRaw) return "under_review";
  const n = Number(achievedRaw);
  if (Number.isNaN(n)) return "under_review";
  const target = weight ?? 3;
  if (n >= target) return "compliant";
  if (n > 0) return "partial";
  return "non_compliant";
}

function buildAuditRef(subsection: string, letter: string, section: string): string {
  const subNum = subsection.match(/^(\d+(?:\.\d+)*)/)?.[1] ?? "";
  if (subNum && letter) return `${subNum}-${letter}`;
  const sectionNum = section.match(/^(\d+(?:\.\d+)*)/)?.[1] ?? "item";
  return letter ? `${sectionNum}-${letter}` : `${sectionNum}-row`;
}

function isMajorSectionRow(col0: string, col1: string): boolean {
  // e.g. "1.1  MANAGEMENT STRUCTURES" (double space + caps section title)
  if (/^\d+\.\d+\s{2,}[A-Z]/.test(col0)) return true;
  // e.g. "2.1 RISK MANAGEMENT, LEGAL AND SYSTEM" (single space, long caps title)
  if (
    /^\d+\.\d+\s+[A-Z]/.test(col0) &&
    !/^\d+\.\d+\.\d+/.test(col0) &&
    col1 !== "Weight" &&
    col0.length > 28 &&
    /[A-Z]{3,}/.test(col0)
  ) {
    return true;
  }
  return false;
}

function isSubsectionHeaderRow(col0: string, col1: string): boolean {
  if (col1 !== "Weight") return false;
  return /^\d+\.\d+(\.\d+)?\s+\S/.test(col0);
}

/** Parse Salus HSE audit Excel rows (Health and Safety Audit.xlsx layout). */
export function parseAuditSpreadsheetRows(rows: unknown[][]): ParsedAuditRow[] {
  let major = "";
  let subsection = "";
  const items: ParsedAuditRow[] = [];

  for (const r of rows) {
    const col0 = String(r[0] ?? "").trim();
    const col1 = String(r[1] ?? "").trim();
    if (!col0 || col0 === "TOTAL" || col0 === "Element") continue;

    if (isMajorSectionRow(col0, col1)) {
      major = col0;
      subsection = "";
      continue;
    }

    if (isSubsectionHeaderRow(col0, col1)) {
      subsection = col0;
      if (!major) {
        const sectionNum = col0.match(/^(\d+)\./)?.[1];
        if (sectionNum) major = `Section ${sectionNum}`;
      }
      continue;
    }

    if (!/^[a-z]\)/i.test(col0)) continue;

    const letter = col0.match(/^([a-z])\)/i)?.[1]?.toLowerCase() ?? "";
    const auditRef = buildAuditRef(subsection, letter, major);

    const weight = col1 !== "" && !Number.isNaN(Number(col1)) ? Number(col1) : null;
    const achievedRaw = String(r[2] ?? "").trim();
    const scoreRaw = r[3];
    const score =
      scoreRaw !== "" && scoreRaw != null && !Number.isNaN(Number(scoreRaw))
        ? Number(scoreRaw)
        : null;
    const observations = String(r[4] ?? "").trim();

    items.push({
      auditRef,
      section: major,
      subsection,
      requirement: col0,
      legislation: mapLegislationFromAudit(major, subsection, col0),
      appliesTo: "Whole site",
      weight,
      achieved: achievedRaw || null,
      score,
      observations: observations || null,
      status: statusFromAchieved(achievedRaw, weight),
    });
  }

  // Ensure every auditRef is unique (safety net)
  const seenRefs = new Set<string>();
  for (const item of items) {
    let ref = item.auditRef;
    let suffix = 2;
    while (ref && seenRefs.has(ref)) {
      ref = `${item.auditRef}-${suffix++}`;
    }
    item.auditRef = ref;
    seenRefs.add(ref);
  }

  return items;
}

export function complianceItemKey(item: {
  auditRef?: string | null;
  legislation: string;
  requirement: string;
}): string {
  if (item.auditRef?.trim()) return `ref:${item.auditRef.trim().toLowerCase()}`;
  return `req:${item.legislation.toLowerCase().trim()}::${item.requirement.toLowerCase().trim()}`;
}

export function auditItemToCreateData(
  companyId: string,
  item: ParsedAuditRow
) {
  return {
    companyId,
    auditRef: item.auditRef || null,
    section: item.section || null,
    subsection: item.subsection || null,
    legislation: item.legislation,
    requirement: item.requirement,
    appliesTo: item.appliesTo,
    status: item.status,
    weight: item.weight,
    achieved: item.achieved,
    score: item.score,
    observations: item.observations,
    evidenceNotes: item.observations,
  };
}
