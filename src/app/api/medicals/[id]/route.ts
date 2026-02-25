import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;

    const medical = await prisma.medical.findUnique({
      where: { id: Number(id) },
      select: { companyId: true },
    });
    if (!medical) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (
      current.role !== "super" &&
      current.companyId != null &&
      medical.companyId !== current.companyId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.medical.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
