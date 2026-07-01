/** Shared access rules for inspection records (API + view pages). */
export function canAccessInspection(
  current: {
    role: string;
    companyId: string | null;
    inspectionDepartments: string[] | null;
  },
  inspection: { department: string; companyId: string | null }
) {
  const depts = current.inspectionDepartments ?? [];
  const canAccessAnyDepartment = depts.length === 0;
  if (current.role === "super") return true;
  if (
    inspection.companyId != null &&
    current.companyId != null &&
    inspection.companyId !== current.companyId
  ) {
    return false;
  }
  if (!canAccessAnyDepartment && !depts.includes(inspection.department)) return false;
  return true;
}
