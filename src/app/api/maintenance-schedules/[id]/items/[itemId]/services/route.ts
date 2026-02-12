import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: scheduleId, itemId } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const schedule = await prisma.maintenanceSchedule.findFirst({
    where: {
      id: scheduleId,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
    include: { items: { where: { id: itemId } } },
  });
  if (!schedule || schedule.items.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { serviceDate, description, meterReading, nextDueDate, performedBy, notes } = body;
  if (!serviceDate) {
    return NextResponse.json(
      { error: "Service date is required" },
      { status: 400 }
    );
  }

  const service = await prisma.maintenanceService.create({
    data: {
      itemId,
      serviceDate: new Date(serviceDate),
      description: description ? String(description).trim() : null,
      meterReading: meterReading != null ? Number(meterReading) : null,
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      performedBy: performedBy ? String(performedBy).trim() : null,
      notes: notes ? String(notes).trim() : null,
    },
  });
  return NextResponse.json(service, { status: 201 });
}
