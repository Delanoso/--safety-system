import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
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

    const data = JSON.stringify({ columns, legendItems, rows });

    if (frequency === "daily") {
      await prisma.dailyInspection.upsert({
        where: { id },
        update: {
          department,
          inspector: inspectorName,
          data,
        },
        create: {
          id,
          department,
          inspector: inspectorName,
          data,
        },
      });
    } else if (frequency === "weekly") {
      await prisma.weeklyInspection.upsert({
        where: { id },
        update: {
          department,
          inspector: inspectorName,
          data,
        },
        create: {
          id,
          department,
          inspector: inspectorName,
          data,
        },
      });
    } else if (frequency === "monthly") {
      await prisma.monthlyInspection.upsert({
        where: { id },
        update: {
          department,
          inspector: inspectorName,
          data,
        },
        create: {
          id,
          department,
          inspector: inspectorName,
          data,
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
    console.error("Error saving inspection:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

