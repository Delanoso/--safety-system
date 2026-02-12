import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await prisma.medical.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
