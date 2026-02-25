/**
 * Module-level access control.
 * allowedModules on User: null or empty = full access. Otherwise only these slugs are allowed.
 */

export const MODULES = [
  { slug: "dashboard", label: "Dashboard" },
  { slug: "notifications", label: "Notifications" },
  { slug: "docs", label: "Health & Safety (Docs)" },
  { slug: "training", label: "Training" },
  { slug: "medicals", label: "Medicals" },
  { slug: "ppe-management", label: "PPE Management" },
  { slug: "she-committee", label: "SHE Committee" },
  { slug: "risk-assessments", label: "Risk Assessments" },
  { slug: "hazardous-chemicals", label: "Hazardous Chemicals" },
  { slug: "legal-registers", label: "Legal Registers" },
  { slug: "appointments", label: "Appointments" },
  { slug: "inspections", label: "Inspections" },
  { slug: "incidents", label: "Incidents" },
  { slug: "maintenance-schedule", label: "Maintenance Schedule" },
  { slug: "users", label: "Users" },
  { slug: "contractors", label: "Contractors" },
] as const;

export type ModuleSlug = (typeof MODULES)[number]["slug"];

/** Path prefix to module slug. First match wins. */
const PATH_TO_MODULE: { prefix: string; module: ModuleSlug }[] = [
  { prefix: "/dashboard/notifications", module: "notifications" },
  { prefix: "/dashboard", module: "dashboard" },
  { prefix: "/docs", module: "docs" },
  { prefix: "/training", module: "training" },
  { prefix: "/medicals", module: "medicals" },
  { prefix: "/ppe-management", module: "ppe-management" },
  { prefix: "/she-committee", module: "she-committee" },
  { prefix: "/risk-assessments", module: "risk-assessments" },
  { prefix: "/hazardous-chemicals", module: "hazardous-chemicals" },
  { prefix: "/legal-registers", module: "legal-registers" },
  { prefix: "/appointments", module: "appointments" },
  { prefix: "/inspections", module: "inspections" },
  { prefix: "/incidents", module: "incidents" },
  { prefix: "/maintenance-schedule", module: "maintenance-schedule" },
  { prefix: "/users", module: "users" },
  { prefix: "/contractors", module: "contractors" },
];

/**
 * Returns the module slug for a pathname, or null if the path is not restricted (e.g. login, signup).
 */
export function getModuleFromPath(pathname: string): ModuleSlug | null {
  const path = pathname.split("?")[0] || "";
  for (const { prefix, module } of PATH_TO_MODULE) {
    if (path === prefix || path.startsWith(prefix + "/")) return module;
  }
  return null;
}

/**
 * Returns true if the user has access to the given module.
 * allowedModules null or empty = full access.
 */
export function canAccessModule(
  allowedModules: string[] | null | undefined,
  moduleSlug: string
): boolean {
  if (!allowedModules || allowedModules.length === 0) return true;
  return allowedModules.includes(moduleSlug);
}
