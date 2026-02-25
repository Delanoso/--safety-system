import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemTypeIdParam = searchParams.get("itemTypeId");
  const itemTypeId = itemTypeIdParam ? parseInt(itemTypeIdParam, 10) : undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 500);

  const where = itemTypeId && Number.isInteger(itemTypeId) ? { itemTypeId } : {};

  const movements = await prisma.pPEStockMovement.findMany({
    where,
    include: { itemType: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return NextResponse.json(movements);
}
