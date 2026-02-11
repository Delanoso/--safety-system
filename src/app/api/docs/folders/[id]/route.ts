import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // Delete files in this folder
  await prisma.file.deleteMany({ where: { folderId: id } });

  // Delete the folder
  await prisma.folder.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

