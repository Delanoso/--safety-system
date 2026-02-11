import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ⭐ REQUIRED in Next.js 16

  await prisma.certificate.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}

