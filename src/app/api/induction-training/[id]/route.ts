import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertCompanyAccess } from "@/lib/site-safety-api";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;
    const record = await prisma.inductionTraining.findUnique({
      where: { id: Number(id) },
      select: { companyId: true },
    });
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertCompanyAccess(current, record.companyId);
    await prisma.inductionTraining.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((err as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
