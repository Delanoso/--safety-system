import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
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
  const notes = data.notes != null ? String(data.notes).trim() || null : null;
  if (!Number.isInteger(itemTypeId) || !Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json(
      { error: "Valid itemTypeId and positive quantity required." },
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

  const existing = await prisma.pPEStock.findUnique({
    where: { itemTypeId },
    include: { itemType: true },
  });
  const currentQty = existing?.quantity ?? 0;
  const newQty = currentQty + quantity;

  try {
    await prisma.$transaction([
      prisma.pPEStock.upsert({
        where: { itemTypeId },
        create: { itemTypeId, quantity: newQty },
        update: { quantity: newQty },
      }),
      prisma.pPEStockMovement.create({
        data: {
          itemTypeId,
          movementType: "RECEIVE",
          quantityDelta: quantity,
          quantityAfter: newQty,
          reason: "Goods Received",
          notes,
        },
      }),
    ]);
  } catch (err) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Failed to receive stock.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const updated = await prisma.pPEStock.findUnique({
    where: { itemTypeId },
    include: { itemType: true },
  });
  return NextResponse.json(updated);
}
