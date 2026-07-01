import type { InspectionFrequency } from "@/lib/fetch-inspection";

type CachedInspection = {
  id: string;
  type?: string;
  department: string;
  inspectorName: string;
  timestamp: number;
  rows: unknown;
};

/** Optional browser cache — server database is the source of truth. */
export function upsertInspectionCache(
  frequency: InspectionFrequency,
  item: CachedInspection
) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("inspections");
    const all = raw
      ? (JSON.parse(raw) as Record<string, CachedInspection[]>)
      : { daily: [], weekly: [], monthly: [] };
    const list = Array.isArray(all[frequency]) ? all[frequency] : [];
    const idx = list.findIndex((i) => i.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    all[frequency] = list;
    localStorage.setItem("inspections", JSON.stringify(all));
  } catch {
    // Cache is best-effort only.
  }
}
