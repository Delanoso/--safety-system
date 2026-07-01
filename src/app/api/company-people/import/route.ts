import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rowFromSheetRecord } from "@/lib/company-people-excel";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const companyIdParam = formData.get("companyId");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No Excel file provided" }, { status: 400 });
    }

    let companyId = current.companyId;
    if (current.role === "super" && typeof companyIdParam === "string" && companyIdParam) {
      companyId = companyIdParam;
    }
    if (!companyId) {
      return NextResponse.json({ error: "No company associated" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ error: "Excel file has no sheets" }, { status: 400 });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    const parsed = rows
      .map((row) => rowFromSheetRecord(row))
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (parsed.length === 0) {
      return NextResponse.json(
        { error: "No valid rows found. Use the same columns as the Excel download (Name is required)." },
        { status: 400 }
      );
    }

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const row of parsed) {
      try {
        const existing = row.employeeNumber
          ? await prisma.companyPerson.findFirst({
              where: { companyId, employeeNumber: row.employeeNumber },
            })
          : null;

        if (existing) {
          await prisma.companyPerson.update({
            where: { id: existing.id },
            data: {
              name: row.name,
              surname: row.surname ?? null,
              employeeNumber: row.employeeNumber ?? null,
              idNumber: row.idNumber ?? null,
              occupation: row.occupation ?? null,
              department: row.department ?? null,
              supervisor: row.supervisor ?? null,
              contactNumber: row.contactNumber ?? null,
              address: row.address ?? null,
            },
          });
          updated++;
        } else {
          await prisma.companyPerson.create({
            data: {
              companyId,
              name: row.name,
              surname: row.surname ?? null,
              employeeNumber: row.employeeNumber ?? null,
              idNumber: row.idNumber ?? null,
              occupation: row.occupation ?? null,
              department: row.department ?? null,
              supervisor: row.supervisor ?? null,
              contactNumber: row.contactNumber ?? null,
              address: row.address ?? null,
            },
          });
          created++;
        }
      } catch (e) {
        errors.push(`${row.name}: ${e instanceof Error ? e.message : "failed"}`);
      }
    }

    return NextResponse.json({
      ok: true,
      created,
      updated,
      total: parsed.length,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/company-people/import", err);
    return NextResponse.json({ error: "Failed to import Excel file" }, { status: 500 });
  }
}
