import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.file.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("FILE DELETE ERROR:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Missing name" },
        { status: 400 }
      );
    }

    const file = await prisma.file.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(file);
  } catch (err) {
    console.error("FILE RENAME ERROR:", err);
    return NextResponse.json({ error: "Rename failed" }, { status: 500 });
  }
}

