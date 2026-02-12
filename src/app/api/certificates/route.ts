import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const certificates = await prisma.certificate.findMany({
    orderBy: { expiryDate: "asc" },
  });

  return NextResponse.json(certificates);
}

export async function POST(req: Request) {
  let data: Record<string, unknown>;

  try {
    data = await req.json();
  } catch {
    const text = await req.text();
    data = typeof text === "string" && text ? JSON.parse(text) : {};
  }

  if (!data || typeof data !== "object") {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const fileUrl =
    typeof data.fileUrl === "string" && data.fileUrl.trim()
      ? data.fileUrl.trim()
      : null;

  const certificate = await prisma.certificate.create({
    data: {
      employee: String(data.employee ?? ""),
      certificateName: String(data.certificateName ?? ""),
      certificateType: data.certificateType != null ? String(data.certificateType) : null,
      issueDate: new Date(data.issueDate as string | number),
      expiryDate: new Date(data.expiryDate as string | number),
      notes: data.notes != null ? String(data.notes) : null,
      fileUrl,
    },
  });

  return NextResponse.json(certificate);
}

