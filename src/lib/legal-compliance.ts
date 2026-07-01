export const COMPLIANCE_STATUSES = [
  { value: "compliant", label: "Compliant", color: "bg-green-100 text-green-800" },
  { value: "partial", label: "Partial", color: "bg-amber-100 text-amber-800" },
  { value: "non_compliant", label: "Non-compliant", color: "bg-red-100 text-red-800" },
  { value: "not_applicable", label: "Not applicable", color: "bg-gray-100 text-gray-700" },
  { value: "under_review", label: "Under review", color: "bg-blue-100 text-blue-800" },
] as const;

export type ComplianceStatus = (typeof COMPLIANCE_STATUSES)[number]["value"];

export const LEGISLATION_OPTIONS = [
  "Occupational Health and Safety Act 85 of 1993 (OHSA)",
  "General Safety Regulations (GSR)",
  "General Administrative Regulations (GAR)",
  "General Machinery Regulations (GMR)",
  "Construction Regulations, 2014",
  "Facilities Regulations",
  "Electrical Installation Regulations",
  "Electrical Machinery Regulations",
  "Hazardous Chemical Agents Regulations (HCA), 2021",
  "Major Hazard Installation Regulations (MHI)",
  "Mine Health and Safety Act 29 of 1996 (MHSA)",
  "Compensation for Occupational Injuries and Diseases Act (COIDA)",
  "National Environmental Management Act (NEMA)",
  "Fire Brigade Services Act 99 of 1987",
  "Salus HSE Audit Checklist",
  "Other / Custom",
] as const;

export const APPLIES_TO_OPTIONS = [
  "Whole site",
  "Construction activities",
  "Office / administration",
  "Workshop / production",
  "Warehouse / logistics",
  "Specific department",
  "Contractors on site",
] as const;

export type LegalComplianceStarterItem = {
  legislation: string;
  requirement: string;
  appliesTo: string;
  status: ComplianceStatus;
  evidenceNotes?: string;
};

/** Typical SA HSE obligations — seeded once per company (skips duplicates). */
export const LEGAL_COMPLIANCE_STARTER_ITEMS: LegalComplianceStarterItem[] = [
  {
    legislation: "Occupational Health and Safety Act 85 of 1993 (OHSA)",
    requirement: "Section 16(1) — CEO accountability for occupational health and safety",
    appliesTo: "Whole site",
    status: "under_review",
    evidenceNotes: "Section 16(1) appointment letter in Appointments module",
  },
  {
    legislation: "Occupational Health and Safety Act 85 of 1993 (OHSA)",
    requirement: "Section 16(2) — Appointment of person(s) to assist the CEO",
    appliesTo: "Whole site",
    status: "under_review",
    evidenceNotes: "16.2 appointment in Appointments module",
  },
  {
    legislation: "Occupational Health and Safety Act 85 of 1993 (OHSA)",
    requirement: "Section 19–20 — Health and safety committee (where required)",
    appliesTo: "Whole site",
    status: "under_review",
    evidenceNotes: "SHE Committee meetings and elections in Salus",
  },
  {
    legislation: "Occupational Health and Safety Act 85 of 1993 (OHSA)",
    requirement: "Section 37(2) — Agreement between client and contractor",
    appliesTo: "Contractors on site",
    status: "under_review",
    evidenceNotes: "37.2 agreements in Contractors safety file",
  },
  {
    legislation: "General Safety Regulations (GSR)",
    requirement: "GSR 3 — First aid facilities, boxes, and trained first aiders",
    appliesTo: "Whole site",
    status: "under_review",
    evidenceNotes: "First aider appointments; first aid inspections",
  },
  {
    legislation: "General Safety Regulations (GSR)",
    requirement: "GSR 3 — Fire-fighting equipment and emergency plan",
    appliesTo: "Whole site",
    status: "under_review",
    evidenceNotes: "Fire equipment inspections; emergency procedures in Uploads",
  },
  {
    legislation: "General Safety Regulations (GSR)",
    requirement: "GSR 2 — Personal protective equipment (PPE) provided and used",
    appliesTo: "Whole site",
    status: "under_review",
    evidenceNotes: "PPE issue register and stock in Salus",
  },
  {
    legislation: "General Safety Regulations (GSR)",
    requirement: "Risk assessments conducted for workplace hazards",
    appliesTo: "Whole site",
    status: "under_review",
    evidenceNotes: "Risk assessments module",
  },
  {
    legislation: "General Administrative Regulations (GAR)",
    requirement: "GAR 9 — Incident reporting and investigation",
    appliesTo: "Whole site",
    status: "under_review",
    evidenceNotes: "Incidents module; COID forms in incident documentation",
  },
  {
    legislation: "General Machinery Regulations (GMR)",
    requirement: "GMR — Machinery inspections and operator competency",
    appliesTo: "Workshop / production",
    status: "under_review",
    evidenceNotes: "Inspections register; training certificates; operator licenses",
  },
  {
    legislation: "Construction Regulations, 2014",
    requirement: "Construction safety file maintained for construction work",
    appliesTo: "Construction activities",
    status: "not_applicable",
    evidenceNotes: "Contractors portal safety file sections",
  },
  {
    legislation: "Construction Regulations, 2014",
    requirement: "Fall protection plan where work at height is performed",
    appliesTo: "Construction activities",
    status: "not_applicable",
    evidenceNotes: "Fall protection plan in contractor / company safety file",
  },
  {
    legislation: "Hazardous Chemical Agents Regulations (HCA), 2021",
    requirement: "Hazardous chemical register and SDS available",
    appliesTo: "Whole site",
    status: "under_review",
    evidenceNotes: "Hazardous chemicals register in Salus",
  },
  {
    legislation: "Compensation for Occupational Injuries and Diseases Act (COIDA)",
    requirement: "COID registration and letter of good standing",
    appliesTo: "Whole site",
    status: "under_review",
    evidenceNotes: "Upload letter of good standing to safety file or evidence here",
  },
  {
    legislation: "Electrical Installation Regulations",
    requirement: "Electrical installations inspected and certificates of compliance",
    appliesTo: "Whole site",
    status: "under_review",
    evidenceNotes: "Electrical inspections; accredited electrician appointment",
  },
  {
    legislation: "Facilities Regulations",
    requirement: "Sanitation, hygiene, and eating facilities",
    appliesTo: "Whole site",
    status: "under_review",
    evidenceNotes: "Hygiene facility inspections; Uploads → Hygiene Facilities",
  },
];

export function statusLabel(status: string): string {
  return COMPLIANCE_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function statusColorClass(status: string): string {
  return COMPLIANCE_STATUSES.find((s) => s.value === status)?.color ?? "bg-gray-100 text-gray-700";
}

export function isReviewOverdue(nextReviewDue: string | Date | null | undefined): boolean {
  if (!nextReviewDue) return false;
  const due = typeof nextReviewDue === "string" ? new Date(nextReviewDue) : nextReviewDue;
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function parseDateInput(value: string | null | undefined): Date | null {
  if (!value || !String(value).trim()) return null;
  const d = new Date(String(value).trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateDisplay(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
}
