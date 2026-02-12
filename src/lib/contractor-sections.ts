export const CONTRACTOR_SECTIONS = [
  { id: "company_registration", label: "Company Registration" },
  { id: "insurance", label: "Insurance" },
  { id: "health_safety_policy", label: "Health & Safety Policy" },
  { id: "risk_assessments", label: "Risk Assessments" },
  { id: "method_statements", label: "Method Statements" },
  { id: "training_certificates", label: "Training Certificates" },
  { id: "ppe_requirements", label: "PPE Requirements" },
  { id: "emergency_procedures", label: "Emergency Procedures" },
  { id: "environmental", label: "Environmental" },
  { id: "other", label: "Other" },
] as const;

export type ContractorSectionId = (typeof CONTRACTOR_SECTIONS)[number]["id"];
