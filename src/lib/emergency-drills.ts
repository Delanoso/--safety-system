export const DRILL_TYPES = [
  { value: "fire_evacuation", label: "Fire / Evacuation Drill" },
  { value: "fire_fighting", label: "Fire Fighting Drill" },
  { value: "spill_response", label: "Spill / Hazardous Substance Response" },
  { value: "medical_emergency", label: "Medical Emergency Drill" },
  { value: "earthquake", label: "Earthquake / Structural Emergency" },
  { value: "lockdown", label: "Lockdown / Security Drill" },
  { value: "other", label: "Other Emergency Drill" },
] as const;

export const DRILL_STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function drillTypeLabel(value: string): string {
  return DRILL_TYPES.find((d) => d.value === value)?.label ?? value;
}

export function drillStatusLabel(value: string): string {
  return DRILL_STATUSES.find((d) => d.value === value)?.label ?? value;
}
