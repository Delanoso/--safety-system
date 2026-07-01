import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generateRiskAssessment } from "@/lib/risk-assessment-engine";

export const dynamic = "force-dynamic";

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

    const { industrySector, assessmentType, description } = body;
    if (!industrySector || !assessmentType) {
      return NextResponse.json(
        { error: "Industry sector and assessment type are required" },
        { status: 400 }
      );
    }

    const generated = generateRiskAssessment({
      industrySector: String(industrySector).trim(),
      assessmentType: String(assessmentType).trim(),
      description: description ? String(description).trim() : null,
    });

    const assessment = await prisma.riskAssessment.create({
      data: {
        title: generated.title,
        department: generated.department,
        location: generated.location,
        assessor: null,
        riskLevel: generated.riskLevel,
        controls: generated.controls,
        industrySector: generated.industrySector,
        assessmentType: generated.assessmentType,
        description: generated.description,
        status: "draft",
        companyId: companyId ?? body.companyId ?? null,
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (err) {
    console.error("Risk assessment generate:", err);
    const message = err instanceof Error ? err.message : "Failed to generate";
    return NextResponse.json(
      { error: "Failed to generate", details: message },
      { status: 500 }
    );
  }
}
