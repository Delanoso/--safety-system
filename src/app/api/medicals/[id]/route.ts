import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

async function getAuthorizedMedical(id: number) {
  const current = await requireUser();
  const medical = await prisma.medical.findUnique({
    where: { id },
  });
  if (!medical) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  if (
    current.role !== "super" &&
    current.companyId != null &&
    medical.companyId !== current.companyId
  ) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { current, medical };
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await getAuthorizedMedical(Number(id));
    if ("error" in result) return result.error;
    return NextResponse.json(result.medical);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await getAuthorizedMedical(Number(id));
    if ("error" in result) return result.error;

    let data: Record<string, unknown>;
    try {
      data = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const employee =
      data.employee != null ? String(data.employee).trim() : undefined;
    const medicalType =
      data.medicalType != null ? String(data.medicalType).trim() : undefined;

    if (employee !== undefined && !employee) {
      return NextResponse.json(
        { error: "Employee name is required." },
        { status: 400 }
      );
    }
    if (medicalType !== undefined && !medicalType) {
      return NextResponse.json(
        { error: "Medical type is required." },
        { status: 400 }
      );
    }

    const fileUrl =
      data.fileUrl === undefined
        ? undefined
        : typeof data.fileUrl === "string" && data.fileUrl.trim()
          ? data.fileUrl.trim()
          : null;

    const updated = await prisma.medical.update({
      where: { id: Number(id) },
      data: {
        ...(employee !== undefined && { employee }),
        ...(medicalType !== undefined && { medicalType }),
        ...(data.issueDate != null && {
          issueDate: new Date(data.issueDate as string | number),
        }),
        ...(data.expiryDate != null && {
          expiryDate: new Date(data.expiryDate as string | number),
        }),
        ...(data.notes !== undefined && {
          notes: data.notes != null ? String(data.notes) : null,
        }),
        ...(fileUrl !== undefined && { fileUrl }),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Failed to update medical.";
    console.error("Medical update error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await getAuthorizedMedical(Number(id));
    if ("error" in result) return result.error;

    await prisma.medical.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
