import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Empty = can view all departments (e.g. demo user). */
function allowedDepartments(user: { inspectionDepartments: string[] | null }): string[] | null {
  const list = user.inspectionDepartments ?? [];
  if (list.length === 0) return null; // null = all departments
  return list;
}

export async function GET(req: Request) {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const department = searchParams.get("department");
  const frequency = searchParams.get("frequency"); // daily | weekly | monthly

  const depts = allowedDepartments(current);
  const viewAll = depts === null;

  if (!viewAll) {
    if (!department || !depts.includes(department)) {
      return NextResponse.json(
        { error: "Invalid or unauthorized department." },
        { status: 400 }
      );
    }
  }

  const where: { department?: string; companyId?: string | null } = {};
  if (!viewAll && department) where.department = department;
  if (current.role !== "super" && current.companyId != null) {
    where.companyId = current.companyId;
  }
  const whereClause = Object.keys(where).length ? where : undefined;

  if (!frequency || !["daily", "weekly", "monthly"].includes(frequency)) {
    return NextResponse.json(
      { error: "Invalid frequency. Use daily, weekly, or monthly." },
      { status: 400 }
    );
  }

  /** Read inspection type from data JSON (inspectionType column may not exist in DB). */
  function typeFromData(data: string, defaultLabel: string): string {
    try {
      const parsed = JSON.parse(data) as { type?: string };
      return typeof parsed.type === "string" && parsed.type.trim()
        ? parsed.type.trim()
        : defaultLabel;
    } catch {
      return defaultLabel;
    }
  }

  if (frequency === "daily") {
    const list = await prisma.dailyInspection.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: { id: true, department: true, inspector: true, data: true, createdAt: true },
    });
    return NextResponse.json(
      list.map((r) => ({
        id: r.id,
        type: typeFromData(r.data, "Daily Inspection"),
        department: r.department,
        inspectorName: r.inspector,
        timestamp: r.createdAt.getTime(),
      }))
    );
  }

  if (frequency === "weekly") {
    const list = await prisma.weeklyInspection.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: { id: true, department: true, inspector: true, data: true, createdAt: true },
    });
    return NextResponse.json(
      list.map((r) => ({
        id: r.id,
        type: typeFromData(r.data, "Weekly Inspection"),
        department: r.department,
        inspectorName: r.inspector,
        timestamp: r.createdAt.getTime(),
      }))
    );
  }

  const list = await prisma.monthlyInspection.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: { id: true, department: true, inspector: true, data: true, createdAt: true },
  });
  return NextResponse.json(
    list.map((r) => ({
      id: r.id,
      type: typeFromData(r.data, "Monthly Inspection"),
      department: r.department,
      inspectorName: r.inspector,
      timestamp: r.createdAt.getTime(),
    }))
  );
}
