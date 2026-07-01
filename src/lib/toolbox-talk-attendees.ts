export type ToolboxAttendeeDraft = {
  name: string;
  surname: string;
  idNumber: string;
  department: string;
  companyPersonId: string | null;
};

export type ToolboxAttendeeRecord = ToolboxAttendeeDraft & {
  id?: string;
  signature?: string | null;
  signedAt?: string | null;
  signToken?: string | null;
};

export function attendeeDisplayName(a: {
  name: string;
  surname?: string | null;
}): string {
  return [a.name, a.surname].filter(Boolean).join(" ");
}

export function parseAttendeeInput(raw: unknown): ToolboxAttendeeDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const name = String(o.name ?? "").trim();
  if (!name) return null;
  return {
    name,
    surname: String(o.surname ?? "").trim(),
    idNumber: String(o.idNumber ?? "").trim(),
    department: String(o.department ?? "").trim(),
    companyPersonId:
      typeof o.companyPersonId === "string" && o.companyPersonId.trim()
        ? o.companyPersonId.trim()
        : null,
  };
}

import { generateSignToken } from "@/lib/sign-token";

export function attendeeToCreateData(a: ToolboxAttendeeDraft) {
  return {
    name: a.name,
    surname: a.surname || null,
    idNumber: a.idNumber || null,
    department: a.department || null,
    companyPersonId: a.companyPersonId,
    signToken: generateSignToken(),
  };
}

export function isAttendeeSigned(a: { signature?: string | null }): boolean {
  return Boolean(a.signature?.trim());
}
