import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function checkItemTypeAccess(
  id: number,
  current: { role: string; companyId: string | null }
) {
  const itemType = await prisma.pPEItemType.findUnique({
    where: { id },
    select: { companyId: true },
  });
  if (!itemType) return { error: "Not found" as const, status: 404 as const };
  if (current.role !== "super" && itemType.companyId !== current.companyId) {
    return { error: "Forbidden" as const, status: 403 as const };
  }
  return null;
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
  const check = await checkItemTypeAccess(Number(id), current);
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
  const minVal = data.minStockThreshold;
  const reorderVal = data.reorderLevel;
  const minStockThreshold =
    minVal === undefined ? undefined : (minVal === null || minVal === "" ? null : Math.floor(Number(minVal)));
  const reorderLevel =
    reorderVal === undefined ? undefined : (reorderVal === null || reorderVal === "" ? null : Math.floor(Number(reorderVal)));
  const updateData: { name?: string; minStockThreshold?: number | null; reorderLevel?: number | null } = {};
  if (name !== undefined) updateData.name = name;
  if (minStockThreshold !== undefined) updateData.minStockThreshold = minStockThreshold;
  if (reorderLevel !== undefined) updateData.reorderLevel = reorderLevel;
  const itemType = await prisma.pPEItemType.update({
    where: { id: Number(id) },
    data: Object.keys(updateData).length ? updateData : undefined,
  });
  return NextResponse.json(itemType);
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
  const check = await checkItemTypeAccess(Number(id), current);
  if (check) return NextResponse.json({ error: check.error }, { status: check.status });
  await prisma.pPEItemType.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
