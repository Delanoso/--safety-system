import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await prisma.hazardousChemical.findFirst({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, casNumber, location, quantity, unit, sdsUrl, hazardClass, notes } = body;

  const result = await prisma.hazardousChemical.updateMany({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
    data: {
      ...(name != null && { name: String(name).trim() }),
      ...(casNumber != null && { casNumber: casNumber ? String(casNumber).trim() : null }),
      ...(location != null && { location: location ? String(location).trim() : null }),
      ...(quantity != null && { quantity: quantity ? String(quantity).trim() : null }),
      ...(unit != null && { unit: unit ? String(unit).trim() : null }),
      ...(sdsUrl != null && { sdsUrl: sdsUrl ? String(sdsUrl).trim() : null }),
      ...(hazardClass != null && { hazardClass: hazardClass ? String(hazardClass).trim() : null }),
      ...(notes != null && { notes: notes ? String(notes).trim() : null }),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.hazardousChemical.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.hazardousChemical.deleteMany({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
