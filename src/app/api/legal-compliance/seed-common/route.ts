import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { LEGAL_COMPLIANCE_STARTER_ITEMS } from "@/lib/legal-compliance";
import { complianceItemKey } from "@/lib/legal-compliance-audit";
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

    const existing = await prisma.legalComplianceItem.findMany({
      where: { companyId },
      select: { auditRef: true, legislation: true, requirement: true },
    });

    const existingKeys = new Set(existing.map((e) => complianceItemKey(e)));

    const toCreate = LEGAL_COMPLIANCE_STARTER_ITEMS.filter(
      (s) => !existingKeys.has(complianceItemKey(s))
    );

    if (toCreate.length === 0) {
      return NextResponse.json({
        created: 0,
        skipped: LEGAL_COMPLIANCE_STARTER_ITEMS.length,
        message: "All common obligations are already in your register.",
      });
    }

    await prisma.legalComplianceItem.createMany({
      data: toCreate.map((s) => ({
        companyId,
        legislation: s.legislation,
        requirement: s.requirement,
        appliesTo: s.appliesTo,
        status: s.status,
        evidenceNotes: s.evidenceNotes ?? null,
      })),
    });

    return NextResponse.json({
      created: toCreate.length,
      skipped: LEGAL_COMPLIANCE_STARTER_ITEMS.length - toCreate.length,
      message: `Added ${toCreate.length} common SA HSE obligation(s) to your register.`,
    });
  } catch (err) {
    console.error("Legal compliance seed:", err);
    return NextResponse.json({ error: "Failed to seed register" }, { status: 500 });
  }
}
