import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  companyDocumentMimeType,
  contentDispositionFilename,
} from "@/lib/company-documents";

export const dynamic = "force-dynamic";

async function getDocumentForUser(
  id: string,
  current: { companyId: string | null; role: string }
) {
  const doc = await prisma.companyDocument.findUnique({
    where: { id },
    include: { division: true },
  });
  if (!doc) return null;
  if (current.companyId && doc.division.companyId !== current.companyId) return null;
  if (!current.companyId && current.role !== "super") return null;
  return doc;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const doc = await getDocumentForUser(id, current);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const disposition =
    searchParams.get("disposition") === "attachment" ? "attachment" : "inline";

  try {
    const upstream = await fetch(doc.fileUrl);
    if (!upstream.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const buffer = await upstream.arrayBuffer();
    const mimeType =
      doc.mimeType ||
      companyDocumentMimeType(doc.name) ||
      upstream.headers.get("content-type") ||
      "application/octet-stream";

    const filename = contentDispositionFilename(doc.name);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `${disposition}; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Company document file proxy:", err);
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 });
  }
}
