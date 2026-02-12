import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const current = await requireUser();
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
      companyId: explicitCompanyId,
    } = body;

    let companyId: string | null = current.companyId;

    // Allow super user to explicitly choose a company, or work without one
    if (current.role === "super") {
      companyId = explicitCompanyId ?? current.companyId ?? null;
    } else if (!companyId) {
      return NextResponse.json(
        { error: "No company associated with current user" },
        { status: 400 }
      );
    }

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
          typeof details === "string" ? details : JSON.stringify(details),
        companyId,
        createdByUserId: current.id,
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
    const current = await getCurrentUser();

    if (!current) {
      return NextResponse.json(
        { error: "Unauthorized", incidents: [] },
        { status: 401 }
      );
    }

    let where: any = {};

    if (current.role === "super") {
      // see all incidents
    } else if (current.role === "admin") {
      where.companyId = current.companyId ?? undefined;
    } else {
      // normal user: only own incidents inside their company
      where.companyId = current.companyId ?? undefined;
      where.createdByUserId = current.id;
    }

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { images: true, team: true },
    });

    return NextResponse.json({ incidents }, { status: 200 });
  } catch (error) {
    console.error("LIST INCIDENTS ERROR:", error);
    return NextResponse.json({ incidents: [] }, { status: 200 });
  }
}

