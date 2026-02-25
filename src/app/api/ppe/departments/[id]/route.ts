import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function checkDepartmentAccess(
  id: number,
  current: { role: string; companyId: string | null }
) {
  const department = await prisma.pPEDepartment.findUnique({
    where: { id },
    select: { companyId: true },
  });
  if (!department) return { error: "Not found" as const, status: 404 as const };
  if (current.role !== "super" && department.companyId !== current.companyId) {
    return { error: "Forbidden" as const, status: 403 as const };
  }
  return null;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const check = await checkDepartmentAccess(Number(id), current);
  if (check) return NextResponse.json({ error: check.error }, { status: check.status });
  const department = await prisma.pPEDepartment.findUnique({
    where: { id: Number(id) },
    include: { subDepartments: true },
  });
  if (!department) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(department);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const check = await checkDepartmentAccess(Number(id), current);
  if (check) return NextResponse.json({ error: check.error }, { status: check.status });
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const name = data.name != null ? String(data.name).trim() : undefined;
  if (name !== undefined && !name) {
    return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
  }
  const department = await prisma.pPEDepartment.update({
    where: { id: Number(id) },
    data: name !== undefined ? { name } : undefined,
  });
  return NextResponse.json(department);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const check = await checkDepartmentAccess(Number(id), current);
  if (check) return NextResponse.json({ error: check.error }, { status: check.status });
  await prisma.pPEDepartment.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
