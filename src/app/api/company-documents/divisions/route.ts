import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { resolveCompanyId } from "@/lib/legal-compliance-api";

export const dynamic = "force-dynamic";

function companyWhere(current: { companyId: string | null }) {
  return current.companyId ? { companyId: current.companyId } : {};
}

export async function GET() {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const divisions = await prisma.companyDocumentDivision.findMany({
    where: companyWhere(current),
    orderBy: { name: "asc" },
    include: {
      _count: { select: { documents: true } },
    },
  });

  return NextResponse.json(divisions);
}

export async function POST(req: Request) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const companyId = resolveCompanyId(current, body.companyId);

  if (!name) {
    return NextResponse.json({ error: "Division name is required" }, { status: 400 });
  }
  if (!companyId) {
    return NextResponse.json({ error: "Company is required" }, { status: 400 });
  }

  const existing = await prisma.companyDocumentDivision.findFirst({
    where: { companyId, name: { equals: name, mode: "insensitive" } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A division with this name already exists" },
      { status: 409 }
    );
  }

  const division = await prisma.companyDocumentDivision.create({
    data: { name, companyId },
  });

  return NextResponse.json(division, { status: 201 });
}
