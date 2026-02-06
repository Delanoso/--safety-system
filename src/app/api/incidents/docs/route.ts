import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, fileName, fileType, filePath, linkId, incidentId } = body;

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

