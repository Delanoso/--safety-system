/**
 * Public API - no auth required. Used by the voting page.
 * GET: Fetch election + candidates (with vote count) for a token. Validates token.
 * POST: Submit vote for a candidate. Requires token.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const electionId = url.searchParams.get("electionId");
  const token = url.searchParams.get("token");

  if (!electionId || !token) {
    return NextResponse.json({ error: "electionId and token are required" }, { status: 400 });
  }

  const voter = await prisma.sHEElectionVoter.findFirst({
    where: { electionId, voteToken: token },
    include: {
      election: {
        include: {
          candidates: {
            include: {
              _count: { select: { votes: true } },
            },
          },
        },
      },
    },
  });

  if (!voter) return NextResponse.json({ error: "Invalid or expired voting link" }, { status: 404 });
  if (voter.votedAt) {
    return NextResponse.json({
      alreadyVoted: true,
      election: voter.election,
      message: "You have already voted.",
    });
  }

  return NextResponse.json({
    election: voter.election,
    voterId: voter.id,
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { electionId, token, candidateId } = body;

  if (!electionId || !token || !candidateId) {
    return NextResponse.json(
      { error: "electionId, token and candidateId are required" },
      { status: 400 }
    );
  }

  const voter = await prisma.sHEElectionVoter.findFirst({
    where: { electionId, voteToken: token },
    include: { election: { include: { candidates: true } } },
  });

  if (!voter) return NextResponse.json({ error: "Invalid or expired voting link" }, { status: 404 });
  if (voter.votedAt) return NextResponse.json({ error: "You have already voted" }, { status: 400 });

  const candidate = voter.election.candidates.find((c) => c.id === candidateId);
  if (!candidate) return NextResponse.json({ error: "Invalid candidate" }, { status: 400 });

  if (voter.election.status !== "voting_open") {
    return NextResponse.json({ error: "Voting is closed" }, { status: 400 });
  }

  await prisma.sHEElectionVoter.update({
    where: { id: voter.id },
    data: { candidateId, votedAt: new Date() },
  });

  return NextResponse.json({ ok: true, message: "Vote recorded successfully." });
}
