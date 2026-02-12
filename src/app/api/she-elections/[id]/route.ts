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

  const election = await prisma.sHEElection.findFirst({
    where: {
      id,
      ...(current?.companyId ? { companyId: current.companyId } : {}),
    },
    include: {
      candidates: {
        include: {
          _count: { select: { votes: true } },
        },
      },
      voters: true,
    },
  });

  if (!election) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(election);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, status, startDate, endDate } = body;

  const result = await prisma.sHEElection.updateMany({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
    data: {
      ...(title != null && { title: String(title).trim() }),
      ...(status != null && { status: String(status) }),
      ...(startDate != null && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate != null && { endDate: endDate ? new Date(endDate) : null }),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.sHEElection.findUnique({
    where: { id },
    include: { candidates: true, voters: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.sHEElection.deleteMany({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
