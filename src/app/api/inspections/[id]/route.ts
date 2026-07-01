import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessInspection } from "@/lib/inspection-access";

type Frequency = "daily" | "weekly" | "monthly";

async function findInspection(id: string, frequency: Frequency) {
  const select = {
    id: true,
    department: true,
    inspector: true,
    createdAt: true,
    data: true,
    companyId: true,
  } as const;

  if (frequency === "daily") {
    return prisma.dailyInspection.findUnique({ where: { id }, select });
  }
  if (frequency === "weekly") {
    return prisma.weeklyInspection.findUnique({ where: { id }, select });
  }
  return prisma.monthlyInspection.findUnique({ where: { id }, select });
}

const defaultTypeByFrequency: Record<Frequency, string> = {
  daily: "Daily Inspection",
  weekly: "Weekly Inspection",
  monthly: "Monthly Inspection",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const frequency = searchParams.get("frequency") as Frequency | null;

    if (!id || !frequency || !["daily", "weekly", "monthly"].includes(frequency)) {
      return NextResponse.json(
        { error: "Missing or invalid id and frequency." },
        { status: 400 }
      );
    }

    const inspection = await findInspection(id, frequency);
    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
    }
    if (!canAccessInspection(current, inspection)) {
      return NextResponse.json(
        { error: "You are not allowed to view this inspection." },
        { status: 403 }
      );
    }

    let parsed: {
      type?: string;
      columns?: string[];
      legendItems?: string[];
      rows?: unknown;
    } = {};

    try {
      if (inspection.data) {
        parsed = JSON.parse(inspection.data);
      }
    } catch {
      // keep empty parsed
    }

    return NextResponse.json({
      id: inspection.id,
      type:
        typeof parsed.type === "string" && parsed.type.trim()
          ? parsed.type.trim()
          : defaultTypeByFrequency[frequency],
      department: inspection.department,
      inspectorName: inspection.inspector,
      timestamp: inspection.createdAt.getTime(),
      columns: parsed.columns,
      legendItems: parsed.legendItems,
      rows: parsed.rows,
    });
  } catch (err) {
    console.error("Error loading inspection:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const frequency = searchParams.get("frequency"); // daily | weekly | monthly

    if (!id || !frequency || !["daily", "weekly", "monthly"].includes(frequency)) {
      return NextResponse.json(
        { error: "Missing or invalid id and frequency." },
        { status: 400 }
      );
    }

    const inspection = await findInspection(id, frequency as Frequency);
    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
    }
    if (!canAccessInspection(current, inspection)) {
      return NextResponse.json(
        { error: "You are not allowed to delete this inspection." },
        { status: 403 }
      );
    }

    if (frequency === "daily") {
      await prisma.dailyInspection.delete({ where: { id } });
    } else if (frequency === "weekly") {
      await prisma.weeklyInspection.delete({ where: { id } });
    } else {
      await prisma.monthlyInspection.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting inspection:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
