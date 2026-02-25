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

    const medicals = await prisma.medical.findMany({
      where,
      orderBy: { expiryDate: "asc" },
    });

    return NextResponse.json(medicals);
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

    const employee = String(data.employee ?? "").trim();
    const medicalType = String(data.medicalType ?? "").trim();
    if (!employee) {
      return NextResponse.json(
        { error: "Employee name is required." },
        { status: 400 }
      );
    }
    if (!medicalType) {
      return NextResponse.json(
        { error: "Medical type is required." },
        { status: 400 }
      );
    }

    const medical = await prisma.medical.create({
      data: {
        employee,
        medicalType,
        issueDate: new Date(data.issueDate as string | number),
        expiryDate: new Date(data.expiryDate as string | number),
        notes: data.notes != null ? String(data.notes) : null,
        fileUrl,
        companyId,
      },
    });

    return NextResponse.json(medical);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Failed to save medical.";
    console.error("Medical create error:", err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
