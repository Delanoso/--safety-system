/** Column headers for company people Excel export/import (case-insensitive match). */
export const COMPANY_PEOPLE_HEADERS = [
  "Name",
  "Surname",
  "Employee / clock number",
  "ID number",
  "Occupation",
  "Department",
  "Supervisor",
  "Contact number",
  "Address",
] as const;

export type CompanyPersonRow = {
  name: string;
  surname?: string;
  employeeNumber?: string;
  idNumber?: string;
  occupation?: string;
  department?: string;
  supervisor?: string;
  contactNumber?: string;
  address?: string;
};

function cellStr(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

/** Map a sheet row object (keys = header cells) to a person row. */
export function rowFromSheetRecord(record: Record<string, unknown>): CompanyPersonRow | null {
  const lower = (key: string) => key.toLowerCase().trim();
  const get = (...aliases: string[]) => {
    for (const [k, v] of Object.entries(record)) {
      const lk = lower(k);
      if (aliases.some((a) => lk === a.toLowerCase())) return cellStr(v);
    }
    return "";
  };

  const name = get("name");
  if (!name) return null;

  return {
    name,
    surname: get("surname") || undefined,
    employeeNumber: get("employee / clock number", "employee number", "clock number") || undefined,
    idNumber: get("id number") || undefined,
    occupation: get("occupation") || undefined,
    department: get("department") || undefined,
    supervisor: get("supervisor") || undefined,
    contactNumber: get("contact number", "phone") || undefined,
    address: get("address") || undefined,
  };
}

export function personToExportRow(p: {
  name: string;
  surname?: string | null;
  employeeNumber?: string | null;
  idNumber?: string | null;
  occupation?: string | null;
  department?: string | null;
  supervisor?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  createdAt?: string | Date;
}): (string | number)[] {
  return [
    p.name,
    p.surname ?? "",
    p.employeeNumber ?? "",
    p.idNumber ?? "",
    p.occupation ?? "",
    p.department ?? "",
    p.supervisor ?? "",
    p.contactNumber ?? "",
    p.address ?? "",
    p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
  ];
}
