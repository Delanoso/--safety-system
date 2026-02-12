export const MAINTENANCE_TYPES = [
  { id: "trucks", label: "Trucks & Vehicles", icon: "truck", description: "Fleet vehicles, bakkies, trucks" },
  { id: "machinery", label: "Machinery", icon: "cog", description: "Factory equipment, generators, compressors" },
  { id: "lifting_equipment", label: "Lifting Equipment", icon: "anchor", description: "Cranes, hoists, slings, chain blocks" },
  { id: "other", label: "Other Equipment", icon: "wrench", description: "General scheduled maintenance" },
] as const;

export type MaintenanceTypeId = (typeof MAINTENANCE_TYPES)[number]["id"];

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "number" | "date";
  required?: boolean;
  placeholder?: string;
};

export const MAINTENANCE_TEMPLATES: Record<MaintenanceTypeId, FieldDef[]> = {
  trucks: [
    { key: "equipmentId", label: "Registration / Fleet ID", type: "text", required: true, placeholder: "e.g. ABC 123 GP" },
    { key: "makeModel", label: "Make & Model", type: "text", placeholder: "e.g. Toyota Hilux 2.4" },
    { key: "odometer", label: "Odometer (km)", type: "number", placeholder: "Current reading" },
    { key: "lastServiceDate", label: "Last Service Date", type: "date", required: true },
    { key: "nextServiceDate", label: "Next Service Date", type: "date", required: true },
    { key: "serviceIntervalKm", label: "Service Interval (km)", type: "number", placeholder: "e.g. 15000" },
    { key: "licenseExpiry", label: "License / Roadworthy Expiry", type: "date" },
    { key: "location", label: "Location / Department", type: "text" },
    { key: "notes", label: "Notes", type: "text", placeholder: "Additional info" },
  ],
  machinery: [
    { key: "equipmentId", label: "Asset ID / Equipment Number", type: "text", required: true },
    { key: "description", label: "Description", type: "text", placeholder: "e.g. Generator, Compressor" },
    { key: "hoursRun", label: "Hours Run", type: "number", placeholder: "Total operating hours" },
    { key: "lastServiceDate", label: "Last Service Date", type: "date", required: true },
    { key: "nextServiceDate", label: "Next Service Date", type: "date", required: true },
    { key: "serviceIntervalHours", label: "Service Interval (hours)", type: "number", placeholder: "e.g. 500" },
    { key: "location", label: "Location / Department", type: "text" },
    { key: "notes", label: "Notes", type: "text" },
  ],
  lifting_equipment: [
    { key: "equipmentId", label: "Equipment ID / Serial Number", type: "text", required: true },
    { key: "equipmentType", label: "Type", type: "text", placeholder: "Crane, Hoist, Chain Block, Sling" },
    { key: "lastInspectionDate", label: "Last Thorough Examination", type: "date", required: true },
    { key: "nextInspectionDate", label: "Next Examination Due", type: "date", required: true },
    { key: "loadTestDate", label: "Last Load Test Date", type: "date" },
    { key: "certificationExpiry", label: "Certification Expiry", type: "date" },
    { key: "location", label: "Location", type: "text" },
    { key: "notes", label: "Notes", type: "text" },
  ],
  other: [
    { key: "equipmentId", label: "Equipment ID", type: "text", required: true },
    { key: "description", label: "Description", type: "text" },
    { key: "meterReading", label: "Meter Reading (hours or km)", type: "number" },
    { key: "lastServiceDate", label: "Last Service Date", type: "date", required: true },
    { key: "nextServiceDate", label: "Next Service Date", type: "date", required: true },
    { key: "serviceInterval", label: "Service Interval", type: "text", placeholder: "e.g. 3 months" },
    { key: "location", label: "Location", type: "text" },
    { key: "notes", label: "Notes", type: "text" },
  ],
};

// Equipment ID is stored separately; template may include it or we extract it
export function getEquipmentIdKey(type: MaintenanceTypeId): string {
  const template = MAINTENANCE_TEMPLATES[type];
  const equipmentField = template.find((f) => f.key === "equipmentId");
  return equipmentField ? "equipmentId" : "id";
}
