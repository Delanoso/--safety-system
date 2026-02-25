/** SessionStorage key for the currently selected inspection department (client-side). */
export const INSPECTION_DEPARTMENT_KEY = "inspectionDepartment";

export function getInspectionDepartment(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(INSPECTION_DEPARTMENT_KEY);
}

export function setInspectionDepartment(dept: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(INSPECTION_DEPARTMENT_KEY, dept);
}
