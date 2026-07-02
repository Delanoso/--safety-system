export const REPORT_TYPES = {
  INCIDENT: "incident",
  NEAR_MISS: "near_miss",
  ACCIDENT: "accident",
  COST_ANALYSIS: "cost_analysis",
} as const;

export type ReportType = (typeof REPORT_TYPES)[keyof typeof REPORT_TYPES];

/** User-facing label for incident report types. */
export function incidentTypeLabel(type: string): string {
  switch (type) {
    case REPORT_TYPES.ACCIDENT:
      return "Accident";
    case REPORT_TYPES.NEAR_MISS:
      return "Near Miss";
    case REPORT_TYPES.COST_ANALYSIS:
      return "Cost Analysis";
    default:
      return "Incident";
  }
}

/** PDF download type query param for /api/pdf. */
export function incidentPdfDownloadType(type: string): string {
  if (type === REPORT_TYPES.COST_ANALYSIS) return "cost-analysis";
  return "incident";
}

export const INCIDENT_TYPES = [
  "First Aid Case",
  "Hijacking",
  "Minor Medical",
  "Major Medical",
  "Disabling",
  "Reportable Section 24",
  "Property Damage or Loss",
  "Environmental Incident",
];

export const ACCIDENT_CATEGORIES = [
  "Traffic Accident",
  "Vehicle Collision",
  "Pedestrian vs Vehicle",
  "Rear-end / Side Impact",
  "Equipment Accident",
  "Machinery / Plant",
  "Forklift / Material Handling",
  "Loading / Unloading",
  "Property Damage Only",
];

export const BODY_PARTS = [
  "Eye",
  "Face",
  "Head",
  "Ear",
  "Mouth",
  "Neck",
  "Shoulder",
  "Upper Back",
  "Lower Back",
  "Chest",
  "Abdomen",
  "Hip",
  "Buttocks",
  "Arm",
  "Elbow",
  "Wrist",
  "Hand",
  "Fingers",
  "Thigh",
  "Leg",
  "Knee",
  "Lower Leg",
  "Ankle",
  "Foot",
  "Toes",
  "Lungs",
  "Kidney",
  "Other",
];
