import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public read for external signers (validates role + token). */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const url = new URL(req.url);
  const role = url.searchParams.get("role");
  const token = url.searchParams.get("token");

  if (!role || !token || !["appointer", "appointee"].includes(role)) {
    return NextResponse.json({ error: "Invalid signing link" }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const expectedToken =
    role === "appointer" ? appointment.appointerToken : appointment.appointeeToken;
  if (!expectedToken || expectedToken !== token) {
    return NextResponse.json({ error: "Invalid or expired signing link" }, { status: 403 });
  }

  return NextResponse.json({
    id: appointment.id,
    type: appointment.type,
    appointee: appointment.appointee,
    appointer: appointment.appointer,
    department: appointment.department,
    date: appointment.date,
    status: appointment.status,
    role,
  });
}
