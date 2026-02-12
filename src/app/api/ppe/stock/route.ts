import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const stock = await prisma.pPEStock.findMany({
    include: { itemType: true },
    orderBy: { itemType: { name: "asc" } },
  });
  return NextResponse.json(stock);
}

export async function PUT(req: Request) {
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
  const updated = await prisma.pPEStock.upsert({
    where: { itemTypeId },
    create: { itemTypeId, quantity },
    update: { quantity },
    include: { itemType: true },
  });
  return NextResponse.json(updated);
}
