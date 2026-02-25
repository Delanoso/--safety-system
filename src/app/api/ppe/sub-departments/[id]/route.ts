import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const subDepartment = await prisma.pPESubDepartment.findUnique({
    where: { id: Number(id) },
    include: {
      department: true,
      persons: true,
      ppeItemTypes: { include: { itemType: true } },
    },
  });
  if (!subDepartment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(subDepartment);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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
  const ppeItemTypeIds = data.ppeItemTypeIds;
  const itemIds: number[] =
    Array.isArray(ppeItemTypeIds) ?
      ppeItemTypeIds.map((x: unknown) => Number(x)).filter((n) => Number.isInteger(n) && n > 0)
    : [];

  if (data.ppeItemTypeIds !== undefined) {
    await prisma.$transaction(async (tx) => {
      await tx.pPESubDepartmentItem.deleteMany({ where: { subDepartmentId: Number(id) } });
      if (itemIds.length > 0) {
        await tx.pPESubDepartmentItem.createMany({
          data: [...new Set(itemIds)].map((itemTypeId) => ({
            subDepartmentId: Number(id),
            itemTypeId,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  const subDepartment = await prisma.pPESubDepartment.update({
    where: { id: Number(id) },
    data: name !== undefined ? { name } : undefined,
  });
  const withItems = await prisma.pPESubDepartment.findUnique({
    where: { id: Number(id) },
    include: { department: true, persons: true, ppeItemTypes: { include: { itemType: true } } },
  });
  return NextResponse.json(withItems ?? subDepartment);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await prisma.pPESubDepartment.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
