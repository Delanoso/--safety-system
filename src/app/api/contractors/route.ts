import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { randomBytes } from "crypto";
import { computeContractorCompliance, parseExcludedSections } from "@/lib/contractor-compliance";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const where: { companyId?: string | null } = {};
    if (current.companyId) where.companyId = current.companyId;

    const items = await prisma.contractor.findMany({
      where,
      include: {
        documents: { select: { section: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = items.map((c) => {
      const compliance = computeContractorCompliance(c.documents, c.excludedSections);
      const { documents, ...rest } = c;
      return {
        ...rest,
        compliancePercentage: compliance.percentage,
        complianceComplete: compliance.completeCount,
        complianceApplicable: compliance.applicableCount,
      };
    });
    return NextResponse.json(enriched);
  } catch (err) {
    console.error("Contractors GET:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const body = await req.json();

    const companyId = current.companyId ?? null;
    if (!companyId && current.role !== "super") {
      return NextResponse.json(
        { error: "No company associated with user" },
        { status: 400 }
      );
    }

    const { name, contactEmail, contactPhone, scope, jobDescription, excludedSections } = body;
    if (!name) {
      return NextResponse.json(
        { error: "Contractor company name is required" },
        { status: 400 }
      );
    }

    const uploadToken = randomBytes(24).toString("hex");

    const excluded = parseExcludedSections(excludedSections);
    const excludedJson = excluded.length > 0 ? JSON.stringify(excluded) : null;

    const item = await prisma.contractor.create({
      data: {
        name: String(name).trim(),
        contactEmail: contactEmail ? String(contactEmail).trim() : null,
        contactPhone: contactPhone ? String(contactPhone).trim() : null,
        scope: scope === "specific_job" ? "specific_job" : "ongoing",
        jobDescription: jobDescription ? String(jobDescription).trim() : null,
        excludedSections: excludedJson,
        uploadToken,
        companyId: companyId ?? body.companyId ?? null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("Contractor POST:", err);
    const message = err instanceof Error ? err.message : "Failed to create";
    return NextResponse.json(
      { error: "Failed to create", details: message },
      { status: 500 }
    );
  }
}
