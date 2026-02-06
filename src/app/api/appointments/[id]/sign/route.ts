// src/app/api/appointments/[id]/sign/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const { role, token, signature } = await req.json();

    if (!role || !token || !signature) {
      return NextResponse.json(
        { error: "Missing role, token, or signature" },
        { status: 400 }
      );
    }

    if (role !== "appointer" && role !== "appointee") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Validate token
    if (role === "appointer" && appointment.appointerToken !== token) {
      return NextResponse.json(
        { error: "Invalid or expired signing link" },
        { status: 403 }
      );
    }

    if (role === "appointee" && appointment.appointeeToken !== token) {
      return NextResponse.json(
        { error: "Invalid or expired signing link" },
        { status: 403 }
      );
    }

    // Prepare update object
    const updateData: any = {};

    if (role === "appointer") {
      updateData.appointerSignature = signature;
      updateData.appointerSignedAt = new Date();
      updateData.appointerToken = null;
      updateData.status = "appointer_signed";
    }

    if (role === "appointee") {
      updateData.appointeeSignature = signature;
      updateData.appointeeSignedAt = new Date();
      updateData.appointeeToken = null;
      updateData.status = "appointee_signed";
    }

    // If both parties have signed → mark completed
    const bothSigned =
      (role === "appointer" && appointment.appointeeSignature) ||
      (role === "appointee" && appointment.appointerSignature);

    if (bothSigned) {
      updateData.status = "completed";
    }

    await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ SIGN ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to save signature" },
      { status: 500 }
    );
  }
}
