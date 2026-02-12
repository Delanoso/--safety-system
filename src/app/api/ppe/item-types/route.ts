import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const types = await prisma.pPEItemType.findMany({
    orderBy: { name: "asc" },
    include: { stock: true },
  });
  return NextResponse.json(types);
}

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const name = String(data.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Item name is required." }, { status: 400 });
  }
  const itemType = await prisma.pPEItemType.create({
    data: { name },
  });
  await prisma.pPEStock.create({
    data: { itemTypeId: itemType.id, quantity: 0 },
  });
  const withStock = await prisma.pPEItemType.findUnique({
    where: { id: itemType.id },
    include: { stock: true },
  });
  return NextResponse.json(withStock ?? itemType);
}
