import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: electionId } = await context.params;
  const current = await requireUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const election = await prisma.sHEElection.findFirst({
    where: {
      id: electionId,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (!election) return NextResponse.json({ error: "Election not found" }, { status: 404 });
  if (election.status !== "draft") {
    return NextResponse.json({ error: "Cannot add candidates when voting has started" }, { status: 400 });
  }

  const count = await prisma.sHEElectionCandidate.count({ where: { electionId } });
  if (count >= 10) {
    return NextResponse.json({ error: "Maximum 10 candidates allowed" }, { status: 400 });
  }

  const body = await req.json();
  const { name, department } = body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const candidate = await prisma.sHEElectionCandidate.create({
    data: {
      electionId,
      name: String(name).trim(),
      department: department ? String(department).trim() : null,
    },
  });
  return NextResponse.json(candidate, { status: 201 });
}
