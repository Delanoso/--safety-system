import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const where: { companyId?: string | null } = {};
    if (current.companyId) where.companyId = current.companyId;

    const items = await prisma.riskAssessment.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("Risk assessments GET:", err);
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

    const { title, department, location, assessor, riskLevel, reviewDate, controls, fileUrl } =
      body;
    if (!title || !riskLevel) {
      return NextResponse.json(
        { error: "Title and risk level are required" },
        { status: 400 }
      );
    }

    const item = await prisma.riskAssessment.create({
      data: {
        title: String(title).trim(),
        department: department ? String(department).trim() : null,
        location: location ? String(location).trim() : null,
        assessor: assessor ? String(assessor).trim() : null,
        riskLevel: String(riskLevel).trim(),
        reviewDate: reviewDate ? new Date(reviewDate) : null,
        controls: controls ? String(controls).trim() : null,
        fileUrl: fileUrl ? String(fileUrl).trim() : null,
        companyId: companyId ?? body.companyId ?? null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("Risk assessment POST:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
