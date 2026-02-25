import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const depts = current.inspectionDepartments ?? [];
    const canSaveAnyDepartment = depts.length === 0; // e.g. demo user

    const body = await req.json();

    const {
      id,
      type,
      department,
      inspectorName,
      rows,
      columns,
      legendItems,
      frequency, // "daily" | "weekly" | "monthly"
    } = body;

    if (!id || !department || !inspectorName || !frequency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!canSaveAnyDepartment && !depts.includes(department)) {
      return NextResponse.json(
        { error: "You are not allowed to save inspections for this department." },
        { status: 403 }
      );
    }

    // Demo "view all" users use "__all__" in the UI; store a normal label in the DB to avoid issues
    const departmentToStore =
      canSaveAnyDepartment && department === "__all__" ? "All" : department;

    const companyId = current.role === "super" ? null : current.companyId ?? null;

    // Store type in data JSON (inspectionType column may not exist in DB yet)
    const data = JSON.stringify({
      columns,
      legendItems,
      rows,
      type: typeof type === "string" ? type.trim() || undefined : undefined,
    });

    if (frequency === "daily") {
      await prisma.dailyInspection.upsert({
        where: { id },
        update: {
          department: departmentToStore,
          inspector: inspectorName,
          data,
          companyId,
        },
        create: {
          id,
          department: departmentToStore,
          inspector: inspectorName,
          data,
          companyId,
        },
      });
    } else if (frequency === "weekly") {
      await prisma.weeklyInspection.upsert({
        where: { id },
        update: {
          department: departmentToStore,
          inspector: inspectorName,
          data,
          companyId,
        },
        create: {
          id,
          department: departmentToStore,
          inspector: inspectorName,
          data,
          companyId,
        },
      });
    } else if (frequency === "monthly") {
      await prisma.monthlyInspection.upsert({
        where: { id },
        update: {
          department: departmentToStore,
          inspector: inspectorName,
          data,
          companyId,
        },
        create: {
          id,
          department: departmentToStore,
          inspector: inspectorName,
          data,
          companyId,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid frequency" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error saving inspection:", err);
    const body: { error: string; details?: string } = { error: "Internal server error" };
    if (process.env.NODE_ENV !== "production") body.details = message;
    return NextResponse.json(body, { status: 500 });
  }
}

