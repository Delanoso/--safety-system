export const INDUCTION_TYPES = [
  "Site Induction",
  "Department Induction",
  "Contractor Induction",
  "Refresher Induction",
  "Visitor / Short-term Induction",
  "Other",
] as const;

export const PERMIT_TYPES = [
  { value: "hot_work", label: "Hot Work" },
  { value: "confined_space", label: "Confined Space" },
  { value: "electrical", label: "Electrical Isolation" },
  { value: "height", label: "Work at Height" },
  { value: "excavation", label: "Excavation / Trenching" },
  { value: "general", label: "General Permit to Work" },
] as const;

export const PERMIT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "issued", label: "Issued" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function permitTypeLabel(value: string): string {
  return PERMIT_TYPES.find((p) => p.value === value)?.label ?? value;
}

export function permitStatusLabel(value: string): string {
  return PERMIT_STATUSES.find((p) => p.value === value)?.label ?? value;
}
