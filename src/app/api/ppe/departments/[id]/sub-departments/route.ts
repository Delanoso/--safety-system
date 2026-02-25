import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const subDepartments = await prisma.pPESubDepartment.findMany({
    where: { departmentId: Number(id) },
    include: { _count: { select: { persons: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(subDepartments);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const departmentId = Number(id);
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
  const ppeItemTypeIds = data.ppeItemTypeIds;
  const itemIds: number[] = Array.isArray(ppeItemTypeIds)
    ? ppeItemTypeIds.map((x: unknown) => Number(x)).filter((n) => Number.isInteger(n) && n > 0)
    : [];

  const subDepartment = await prisma.pPESubDepartment.create({
    data: { departmentId, name },
  });
  if (itemIds.length > 0) {
    await prisma.pPESubDepartmentItem.createMany({
      data: [...new Set(itemIds)].map((itemTypeId) => ({
        subDepartmentId: subDepartment.id,
        itemTypeId,
      })),
      skipDuplicates: true,
    });
  }
  const withItems = await prisma.pPESubDepartment.findUnique({
    where: { id: subDepartment.id },
    include: { department: true, ppeItemTypes: { include: { itemType: true } } },
  });
  return NextResponse.json(withItems ?? subDepartment);
}
