import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const where =
    current.role !== "super" && current.companyId != null
      ? { companyId: current.companyId }
      : undefined;
  const departments = await prisma.pPEDepartment.findMany({
    where,
    include: { subDepartments: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(departments);
}

export async function POST(req: Request) {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const companyId =
    current.role === "super" ? null : current.companyId ?? null;
  if (current.role !== "super" && !companyId) {
    return NextResponse.json(
      { error: "No company associated with your account." },
      { status: 400 }
    );
  }
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const name = String(data.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const department = await prisma.pPEDepartment.create({
    data: { name, companyId },
  });
  return NextResponse.json(department);
}
