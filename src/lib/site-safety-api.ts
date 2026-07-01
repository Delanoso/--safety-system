import type { CurrentUser } from "@/lib/auth";

export function companyWhere(current: CurrentUser) {
  if (current.role !== "super" && current.companyId) {
    return { companyId: current.companyId };
  }
  return {};
}

export function companyIdForCreate(current: CurrentUser): string | null {
  if (current.role === "super") return null;
  return current.companyId ?? null;
}

export function assertCompanyAccess(
  current: CurrentUser,
  recordCompanyId: string | null | undefined
) {
  if (current.role === "super") return;
  if (recordCompanyId !== current.companyId) {
    throw new Error("Forbidden");
  }
}

export function trimOrNull(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s || null;
}

export function parseDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? null : d;
}
