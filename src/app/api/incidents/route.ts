import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      type,
      description,
      department,
      employee,
      employeeId,
      location,
      date,
      severity,
      status,
      details,
      companyId, // ⭐ must be included from frontend
    } = body;

    const incident = await prisma.incident.create({
      data: {
        title,
        type,
        description,
        department,
        employee,
        employeeId,
        location,
        date: new Date(date),
        severity,
        status,
        details:
          typeof details === "string"
            ? details
            : JSON.stringify(details),

        companyId, // ⭐ this is the missing field
      },
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error("CREATE INCIDENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: true, team: true },
    });

    return NextResponse.json({ incidents }, { status: 200 });
  } catch (error) {
    console.error("LIST INCIDENTS ERROR:", error);
    return NextResponse.json({ incidents: [] }, { status: 200 });
  }
}

