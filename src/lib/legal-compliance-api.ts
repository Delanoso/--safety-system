import type { CurrentUser } from "@/lib/auth";
import { COMPLIANCE_STATUSES, type ComplianceStatus } from "@/lib/legal-compliance";

export function companyWhere(current: CurrentUser) {
  return current.companyId ? { companyId: current.companyId } : {};
}

export function resolveCompanyId(current: CurrentUser, bodyCompanyId?: unknown): string | null {
  if (current.companyId) return current.companyId;
  if (current.role === "super" && typeof bodyCompanyId === "string" && bodyCompanyId.trim()) {
    return bodyCompanyId.trim();
  }
  return null;
}

export function requireCompanyId(current: CurrentUser, bodyCompanyId?: unknown): string | null {
  const id = resolveCompanyId(current, bodyCompanyId);
  if (!id && current.role !== "super") return null;
  return id;
}

const VALID_STATUSES = new Set<string>(COMPLIANCE_STATUSES.map((s) => s.value));

export function normalizeStatus(value: unknown): ComplianceStatus | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return VALID_STATUSES.has(v) ? (v as ComplianceStatus) : null;
}

export function trimOrNull(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s || null;
}
