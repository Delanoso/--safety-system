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
  let data;

  try {
    // ⭐ Next.js 16: req.json() works ONLY if the request is not streamed
    data = await req.json();
  } catch {
    // ⭐ Fallback for streamed bodies
    const text = await req.text();
    data = JSON.parse(text || "{}");
  }

  const certificate = await prisma.certificate.create({
    data: {
      employee: data.employee,
      certificateName: data.certificateName,
      certificateType: data.certificateType,
      issueDate: new Date(data.issueDate),
      expiryDate: new Date(data.expiryDate),
      notes: data.notes,
      fileUrl: data.fileUrl, // ⭐ finally received correctly
    },
  });

  return NextResponse.json(certificate);
}

