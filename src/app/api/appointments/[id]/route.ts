import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// -------------------------
// GET APPOINTMENT BY ID
// -------------------------
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Invalid appointment ID" },
      { status: 400 }
    );
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (current.role !== "super" && appointment.companyId !== current.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (err) {
    console.error("❌ Prisma GET error:", err);
    return NextResponse.json(
      { error: "Failed to load appointment" },
      { status: 500 }
    );
  }
}

// -------------------------
// PATCH APPOINTMENT
// -------------------------
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Invalid appointment ID" },
      { status: 400 }
    );
  }

  const body = await req.json();

  const {
    status,
    appointeeSignature,
    appointerSignature,
    appointeeToken,
    appointerToken,
  } = body;

  const updateData: Record<string, unknown> = {};

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (current.role !== "super" && existing.companyId !== current.companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (appointeeSignature) {
    updateData.appointeeSignature = appointeeSignature;
    updateData.appointeeSignedAt = new Date();
  }

  if (appointerSignature) {
    updateData.appointerSignature = appointerSignature;
    updateData.appointerSignedAt = new Date();
  }

  if (appointeeToken) updateData.appointeeToken = appointeeToken;
  if (appointerToken) updateData.appointerToken = appointerToken;

  const finalAppointeeSig =
    (appointeeSignature as string | undefined) || existing.appointeeSignature;
  const finalAppointerSig =
    (appointerSignature as string | undefined) || existing.appointerSignature;

  if (finalAppointeeSig && finalAppointerSig) {
    updateData.status = "signed";
  } else if (appointeeSignature) {
    updateData.status = "appointee_signed";
  } else if (appointerSignature) {
    updateData.status = "appointer_signed";
  } else if (status) {
    updateData.status = status;
  }

  try {    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ Prisma PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// -------------------------
// DELETE APPOINTMENT
// -------------------------
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Invalid appointment ID" },
      { status: 400 }
    );
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (current.role !== "super" && appointment.companyId !== current.companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Prisma DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}

