export type InspectionFrequency = "daily" | "weekly" | "monthly";

export type LoadedInspection = {
  id: string;
  type: string;
  department: string;
  inspectorName: string;
  timestamp: number;
  columns?: string[];
  legendItems?: string[];
  rows?: unknown;
};

/** Load a saved inspection from the server (works on any device). */
export async function fetchInspectionById(
  id: string,
  frequency: InspectionFrequency
): Promise<LoadedInspection | null> {
  const res = await fetch(
    `/api/inspections/${encodeURIComponent(id)}?frequency=${frequency}`
  );
  if (!res.ok) return null;
  return res.json();
}
