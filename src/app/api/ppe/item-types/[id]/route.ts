import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  const itemType = await prisma.pPEItemType.update({
    where: { id: Number(id) },
    data: name !== undefined ? { name } : undefined,
  });
  return NextResponse.json(itemType);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await prisma.pPEItemType.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
