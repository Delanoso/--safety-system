import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  auditItemToCreateData,
  complianceItemKey,
  parseAuditSpreadsheetRows,
} from "@/lib/legal-compliance-audit";
import { requireCompanyId } from "@/lib/legal-compliance-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mode = String(formData.get("mode") ?? "merge").trim();

    const companyId = requireCompanyId(current, formData.get("companyId"));
    if (!companyId) {
      return NextResponse.json(
        { error: "No company associated with user" },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ error: "Excel file has no sheets" }, { status: 400 });
    }

    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
      header: 1,
      defval: "",
    }) as unknown[][];

    const parsed = parseAuditSpreadsheetRows(rows);
    if (parsed.length === 0) {
      return NextResponse.json(
        {
          error:
            "No audit questions found. Use the Salus Health and Safety Audit.xlsx format.",
        },
        { status: 400 }
      );
    }

    if (mode === "replace") {
      await prisma.legalComplianceItem.deleteMany({ where: { companyId } });
    }

    const existing = await prisma.legalComplianceItem.findMany({
      where: { companyId },
      select: { id: true, auditRef: true, legislation: true, requirement: true },
    });

    const existingByKey = new Map(
      existing.map((e) => [complianceItemKey(e), e])
    );

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of parsed) {
      const key = complianceItemKey(item);
      const match = existingByKey.get(key);

      if (match) {
        await prisma.legalComplianceItem.update({
          where: { id: match.id },
          data: {
            section: item.section || null,
            subsection: item.subsection || null,
            legislation: item.legislation,
            requirement: item.requirement,
            status: item.status,
            weight: item.weight,
            achieved: item.achieved,
            score: item.score,
            observations: item.observations,
            evidenceNotes: item.observations,
          },
        });
        updated++;
      } else if (mode === "merge" || mode === "replace") {
        const row = await prisma.legalComplianceItem.create({
          data: auditItemToCreateData(companyId, item),
        });
        existingByKey.set(key, row);
        created++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      created,
      updated,
      skipped,
      total: parsed.length,
      message: `Imported audit file: ${created} added, ${updated} updated.`,
    });
  } catch (err) {
    console.error("Legal compliance import:", err);
    return NextResponse.json({ error: "Failed to import audit file" }, { status: 500 });
  }
}
