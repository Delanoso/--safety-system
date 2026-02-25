import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { title, fileName, fileType, filePath, linkId, incidentId } = body;

    if (incidentId) {
      const incident = await prisma.incident.findUnique({
        where: { id: incidentId },
        select: { companyId: true },
      });
      if (!incident) {
        return NextResponse.json({ error: "Incident not found" }, { status: 404 });
      }
      if (current.role !== "super" && incident.companyId !== current.companyId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const doc = await prisma.incidentDocument.create({
      data: {
        title,
        fileName,
        fileType,
        filePath,
        linkId: linkId || null,
        incidentId: incidentId || null,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    console.error("Error saving incident document:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save document" },
      { status: 500 }
    );
  }
}

