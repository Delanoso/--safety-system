import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; itemId: string; serviceId: string }> }
) {
  const { id: scheduleId, itemId, serviceId } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const schedule = await prisma.maintenanceSchedule.findFirst({
    where: {
      id: scheduleId,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (!schedule) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const service = await prisma.maintenanceService.findFirst({
    where: { id: serviceId, itemId },
  });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.maintenanceService.delete({ where: { id: serviceId } });
  return NextResponse.json({ success: true });
}
