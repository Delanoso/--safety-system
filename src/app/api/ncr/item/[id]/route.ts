import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const item = await prisma.ncrItem.findUnique({
      where: { id },
      include: { report: { select: { companyId: true } } },
    });
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (current.role !== "super" && item.report.companyId !== current.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.ncrImage.deleteMany({
      where: { itemId: id },
    });

    await prisma.ncrItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting NCR item:", error);
    return NextResponse.json(
      { error: "Failed to delete NCR item" },
      { status: 500 }
    );
  }
}

