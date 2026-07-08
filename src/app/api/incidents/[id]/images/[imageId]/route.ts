import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: incidentId, imageId } = await context.params;

    const image = await prisma.incidentImage.findUnique({
      where: { id: imageId },
      include: {
        incident: { select: { companyId: true } },
      },
    });

    if (!image || image.incidentId !== incidentId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      current.role !== "super" &&
      image.incident.companyId !== current.companyId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.incidentImage.delete({ where: { id: imageId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE INCIDENT IMAGE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
