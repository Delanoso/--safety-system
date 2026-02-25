import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const current = await requireUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: { status?: string; companyId?: string | null } = {};
    if (status) where.status = status;
    if (current.role !== "super" && current.companyId != null) {
      where.companyId = current.companyId;
    }

    const appointments = await prisma.appointment.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { date: "asc" },
    });

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const current = await requireUser();
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const type = String(body.type ?? "").trim();
    const appointee = String(body.appointee ?? "").trim();
    const appointer = String(body.appointer ?? "").trim();
    const department = String(body.department ?? "").trim();
    const dateRaw = body.date;
    const status = typeof body.status === "string" ? body.status : "draft";
    const bodyCompanyId = typeof body.companyId === "string" ? body.companyId.trim() || null : null;

    if (!type || !appointee || !appointer || !department) {
      return NextResponse.json(
        { error: "Missing required fields: type, appointee, appointer, department" },
        { status: 400 }
      );
    }
    if (!dateRaw) {
      return NextResponse.json(
        { error: "Date of appointment is required" },
        { status: 400 }
      );
    }
    const date = new Date(dateRaw as string | number);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    let companyId: string | null;
    if (current.role === "super") {
      companyId = bodyCompanyId ? bodyCompanyId : (current.companyId ?? null);
      if (!companyId) {
        return NextResponse.json(
          { error: "Please select a company for this appointment" },
          { status: 400 }
        );
      }
      const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
      if (!company) {
        return NextResponse.json(
          { error: "Selected company not found" },
          { status: 400 }
        );
      }
    } else {
      companyId = current.companyId ?? null;
      if (!companyId) {
        return NextResponse.json(
          { error: "No company associated with your account" },
          { status: 400 }
        );
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        type,
        appointee,
        appointer,
        department,
        date,
        status: status || "draft",
        companyId,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating appointment:", error);
    const message = error instanceof Error ? error.message : "Failed to create appointment";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
