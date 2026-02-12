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

    const items = await prisma.hazardousChemical.findMany({
      where,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("Hazardous chemicals GET:", err);
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

    const { name, casNumber, location, quantity, unit, sdsUrl, hazardClass, notes } = body;
    if (!name) {
      return NextResponse.json(
        { error: "Chemical name is required" },
        { status: 400 }
      );
    }

    const item = await prisma.hazardousChemical.create({
      data: {
        name: String(name).trim(),
        casNumber: casNumber ? String(casNumber).trim() : null,
        location: location ? String(location).trim() : null,
        quantity: quantity ? String(quantity).trim() : null,
        unit: unit ? String(unit).trim() : null,
        sdsUrl: sdsUrl ? String(sdsUrl).trim() : null,
        hazardClass: hazardClass ? String(hazardClass).trim() : null,
        notes: notes ? String(notes).trim() : null,
        companyId: companyId ?? body.companyId ?? null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("Hazardous chemical POST:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
