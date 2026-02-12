import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; candidateId: string }> }
) {
  const { id: electionId, candidateId } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const election = await prisma.sHEElection.findFirst({
    where: {
      id: electionId,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (!election) return NextResponse.json({ error: "Election not found" }, { status: 404 });
  if (election.status !== "draft") {
    return NextResponse.json({ error: "Cannot remove candidates when voting has started" }, { status: 400 });
  }

  const candidate = await prisma.sHEElectionCandidate.findFirst({
    where: { id: candidateId, electionId },
  });
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  await prisma.sHEElectionCandidate.delete({ where: { id: candidateId } });
  return NextResponse.json({ success: true });
}
