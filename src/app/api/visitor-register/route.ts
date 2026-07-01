import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  companyWhere,
  companyIdForCreate,
  trimOrNull,
  parseDate,
} from "@/lib/site-safety-api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const current = await requireUser();
    const { searchParams } = new URL(req.url);
    const onSiteOnly = searchParams.get("onSite") === "true";

    const entries = await prisma.visitorRegisterEntry.findMany({
      where: {
        ...companyWhere(current),
        ...(onSiteOnly ? { checkOutAt: null } : {}),
      },
      orderBy: { checkInAt: "desc" },
    });
    return NextResponse.json(entries);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load visitors" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const companyId = companyIdForCreate(current);
    if (current.role !== "super" && !companyId) {
      return NextResponse.json({ error: "No company associated with your account" }, { status: 400 });
    }

    const data = await req.json();
    const visitorName = trimOrNull(data.visitorName);
    const hostName = trimOrNull(data.hostName);
    if (!visitorName) {
      return NextResponse.json({ error: "Visitor name is required." }, { status: 400 });
    }
    if (!hostName) {
      return NextResponse.json({ error: "Host name is required." }, { status: 400 });
    }

    const checkInAt = parseDate(data.checkInAt) ?? new Date();

    const entry = await prisma.visitorRegisterEntry.create({
      data: {
        visitorName,
        visitorCompany: trimOrNull(data.visitorCompany),
        idNumber: trimOrNull(data.idNumber),
        contactNumber: trimOrNull(data.contactNumber),
        hostName,
        hostDepartment: trimOrNull(data.hostDepartment),
        purpose: trimOrNull(data.purpose),
        location: trimOrNull(data.location),
        vehicleReg: trimOrNull(data.vehicleReg),
        notes: trimOrNull(data.notes),
        checkInAt,
        companyId,
      },
    });

    return NextResponse.json(entry);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Visitor check-in:", err);
    return NextResponse.json({ error: "Failed to check in visitor" }, { status: 500 });
  }
}
