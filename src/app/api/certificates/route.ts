import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const current = await requireUser();
    const where =
      current.role !== "super" && current.companyId != null
        ? { companyId: current.companyId }
        : undefined;

    const certificates = await prisma.certificate.findMany({
      where,
      orderBy: { expiryDate: "asc" },
    });

    return NextResponse.json(certificates);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const companyId =
      current.role === "super" ? null : current.companyId ?? null;
    if (current.role !== "super" && !companyId) {
      return NextResponse.json(
        { error: "No company associated with your account" },
        { status: 400 }
      );
    }

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
        companyId,
      },
    });

    return NextResponse.json(certificate);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }
}

