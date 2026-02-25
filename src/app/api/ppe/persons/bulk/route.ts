import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BulkPerson = {
  name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  subDepartment?: string | null;
  sizes?: string | null;
};

export async function POST(req: Request) {
  let body: { persons: BulkPerson[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const persons = Array.isArray(body.persons) ? body.persons : [];
  if (persons.length === 0) {
    return NextResponse.json(
      { error: "No persons to import." },
      { status: 400 }
    );
  }

  const created: { id: number; name: string }[] = [];
  const errors: { row: number; name: string; error: string }[] = [];

  for (let i = 0; i < persons.length; i++) {
    const row = persons[i];
    const name = String(row?.name ?? "").trim();
    if (!name) {
      errors.push({ row: i + 1, name: String(row?.name ?? ""), error: "Name is required." });
      continue;
    }
    try {
      const person = await prisma.pPEPerson.create({
        data: {
          name,
          email: row.email != null ? String(row.email).trim() || null : null,
          phone: row.phone != null ? String(row.phone).trim() || null : null,
          department: row.department != null ? String(row.department).trim() || null : null,
          subDepartment: row.subDepartment != null ? String(row.subDepartment).trim() || null : null,
          sizes: row.sizes != null
            ? (typeof row.sizes === "string" ? row.sizes : JSON.stringify(row.sizes))
            : null,
        },
      });
      created.push({ id: person.id, name: person.name });
    } catch (e) {
      errors.push({
        row: i + 1,
        name,
        error: e instanceof Error ? e.message : "Failed to create",
      });
    }
  }

  return NextResponse.json({
    success: true,
    created: created.length,
    errors: errors.length,
    createdIds: created,
    errorDetails: errors,
  });
}
