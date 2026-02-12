import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const where: { companyId?: string | null } = {};
    if (current.companyId) where.companyId = current.companyId;

    const items = await prisma.maintenanceSchedule.findMany({
      where,
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("Maintenance schedules GET:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const body = await req.json();

    const companyId = current.companyId ?? null;
    if (!companyId && current.role !== "super") {
      return NextResponse.json(
        { error: "No company associated with user" },
        { status: 400 }
      );
    }

    const { title, type, equipmentId, data } = body;
    if (!title || !type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 }
      );
    }

    const validTypes = ["trucks", "machinery", "lifting_equipment", "other"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid schedule type" }, { status: 400 });
    }

    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        title: String(title).trim(),
        type,
        companyId: companyId ?? body.companyId ?? null,
        items: equipmentId
          ? {
              create: {
                equipmentId: String(equipmentId).trim(),
                data: JSON.stringify(data || {}),
              },
            }
          : undefined,
      },
      include: { items: true },
    });
    return NextResponse.json(schedule, { status: 201 });
  } catch (err) {
    console.error("Maintenance schedule POST:", err);
    return NextResponse.json(
      { error: "Failed to create", details: err instanceof Error ? err.message : "" },
      { status: 500 }
    );
  }
}
