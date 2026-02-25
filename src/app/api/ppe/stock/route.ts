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
      ? { itemType: { companyId: current.companyId } }
      : undefined;
  const stock = await prisma.pPEStock.findMany({
    where,
    include: { itemType: true },
    orderBy: { itemType: { name: "asc" } },
  });
  return NextResponse.json(stock);
}

export async function PUT(req: Request) {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const itemTypeId = Number(data.itemTypeId);
  const quantity = Number(data.quantity);
  if (!Number.isInteger(itemTypeId) || !Number.isInteger(quantity) || quantity < 0) {
    return NextResponse.json(
      { error: "Valid itemTypeId and non-negative quantity required." },
      { status: 400 }
    );
  }
  const itemType = await prisma.pPEItemType.findUnique({
    where: { id: itemTypeId },
    select: { companyId: true },
  });
  if (!itemType) {
    return NextResponse.json({ error: "Item type not found." }, { status: 404 });
  }
  if (current.role !== "super" && itemType.companyId !== current.companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const updated = await prisma.pPEStock.upsert({
    where: { itemTypeId },
    create: { itemTypeId, quantity },
    update: { quantity },
    include: { itemType: true },
  });
  return NextResponse.json(updated);
}
