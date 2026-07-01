import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import auditTemplate from "@/data/health-safety-audit-template.json";
import {
  auditItemToCreateData,
  complianceItemKey,
  type ParsedAuditRow,
} from "@/lib/legal-compliance-audit";
import { requireCompanyId } from "@/lib/legal-compliance-api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const body = await req.json().catch(() => ({}));

    const companyId = requireCompanyId(current, body.companyId);
    if (!companyId) {
      return NextResponse.json(
        { error: "No company associated with user" },
        { status: 400 }
      );
    }

    const items = (auditTemplate as { items: ParsedAuditRow[] }).items ?? [];

    const existing = await prisma.legalComplianceItem.findMany({
      where: { companyId },
      select: { auditRef: true, legislation: true, requirement: true },
    });

    const existingKeys = new Set(existing.map((e) => complianceItemKey(e)));

    const toCreate = items.filter((s) => !existingKeys.has(complianceItemKey(s)));

    if (toCreate.length === 0) {
      return NextResponse.json({
        created: 0,
        skipped: items.length,
        message: "Your HSE audit checklist is already fully loaded.",
      });
    }

    await prisma.legalComplianceItem.createMany({
      data: toCreate.map((s) => auditItemToCreateData(companyId, s)),
      skipDuplicates: true,
    });

    return NextResponse.json({
      created: toCreate.length,
      skipped: items.length - toCreate.length,
      total: items.length,
      message: `Loaded ${toCreate.length} audit checklist item(s) from the Salus HSE audit template.`,
    });
  } catch (err) {
    console.error("Legal compliance seed-audit:", err);
    const message = err instanceof Error ? err.message : "Failed to load audit checklist";
    return NextResponse.json({ error: "Failed to load audit checklist", details: message }, { status: 500 });
  }
}
