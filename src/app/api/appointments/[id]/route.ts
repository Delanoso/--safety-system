import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// -------------------------
// GET APPOINTMENT BY ID
// -------------------------
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
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

  const updateData: any = {};

  // Status update
  if (status) updateData.status = status;

  // Appointee signature + timestamp
  if (appointeeSignature) {
    updateData.appointeeSignature = appointeeSignature;
    updateData.appointeeSignedAt = new Date();
  }

  // Appointer signature + timestamp
  if (appointerSignature) {
    updateData.appointerSignature = appointerSignature;
    updateData.appointerSignedAt = new Date();
  }

  // Token updates
  if (appointeeToken) updateData.appointeeToken = appointeeToken;
  if (appointerToken) updateData.appointerToken = appointerToken;

  // ⭐ AUTO-MARK AS SIGNED WHEN BOTH SIGNATURES EXIST
  if (appointeeSignature || appointerSignature) {
    const existing = await prisma.appointment.findUnique({ where: { id } });

    const finalAppointeeSig =
      appointeeSignature || existing?.appointeeSignature;
    const finalAppointerSig =
      appointerSignature || existing?.appointerSignature;

    if (finalAppointeeSig && finalAppointerSig) {
      updateData.status = "signed";
    }
  }

  try {
    const updated = await prisma.appointment.update({
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
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Invalid appointment ID" },
      { status: 400 }
    );
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

