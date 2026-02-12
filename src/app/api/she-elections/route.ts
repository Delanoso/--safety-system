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

    const elections = await prisma.sHEElection.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        candidates: true,
        voters: true,
      },
    });
    return NextResponse.json(elections);
  } catch (err) {
    console.error("SHE elections GET:", err);
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

    const { title, startDate, endDate } = body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const election = await prisma.sHEElection.create({
      data: {
        title: String(title).trim(),
        status: "draft",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        companyId: companyId ?? body.companyId ?? null,
      },
    });
    return NextResponse.json(election, { status: 201 });
  } catch (err) {
    console.error("SHE election POST:", err);
    const message = err instanceof Error ? err.message : "Failed to create";
    return NextResponse.json(
      { error: "Failed to create", details: message },
      { status: 500 }
    );
  }
}
