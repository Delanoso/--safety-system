import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const schedule = await prisma.maintenanceSchedule.findFirst({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
    include: {
      items: {
        include: {
          services: { orderBy: { serviceDate: "desc" } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!schedule) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(schedule);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title } = body;

  const result = await prisma.maintenanceSchedule.updateMany({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
    data: {
      ...(title != null && { title: String(title).trim() }),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.maintenanceSchedule.findUnique({
    where: { id },
    include: { items: { include: { services: true } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.maintenanceSchedule.deleteMany({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
