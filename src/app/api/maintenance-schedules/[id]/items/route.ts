import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: scheduleId } = await context.params;
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
  if (!equipmentId) {
    return NextResponse.json(
      { error: "Equipment ID is required" },
      { status: 400 }
    );
  }

  const item = await prisma.maintenanceItem.create({
    data: {
      scheduleId,
      equipmentId: String(equipmentId).trim(),
      data: JSON.stringify(data || {}),
    },
  });
  return NextResponse.json(item, { status: 201 });
}
