import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
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
  });
  if (!schedule) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { equipmentId, data } = body;

  const updateData: { equipmentId?: string; data?: string } = {};
  if (equipmentId != null) updateData.equipmentId = String(equipmentId).trim();
  if (data != null) updateData.data = JSON.stringify(data);

  const result = await prisma.maintenanceItem.updateMany({
    where: { id: itemId, scheduleId },
    data: updateData,
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.maintenanceItem.findUnique({
    where: { id: itemId },
    include: { services: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
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
  });
  if (!schedule) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await prisma.maintenanceItem.deleteMany({
    where: { id: itemId, scheduleId },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
