import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function generateToken() {
  return crypto.randomUUID();
}

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
    include: { candidates: true },
  });
  if (!election) return NextResponse.json({ error: "Election not found" }, { status: 404 });
  if (election.status !== "voting_open") {
    return NextResponse.json({ error: "Voting is not open. Start the election first." }, { status: 400 });
  }
  if (election.candidates.length < 2) {
    return NextResponse.json({ error: "Need at least 2 candidates to add voters" }, { status: 400 });
  }

  const body = await req.json();
  const votersInput = body.voters;
  if (!Array.isArray(votersInput) || votersInput.length === 0) {
    return NextResponse.json({ error: "voters array is required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const created: { email?: string; phone?: string; voteUrl: string; token: string }[] = [];

  for (const v of votersInput) {
    const email = v.email ? String(v.email).trim() : null;
    const phone = v.phone ? String(v.phone).trim() : null;
    if (!email && !phone) continue;

    const token = generateToken();
    const voteUrl = `${baseUrl}/vote/she/${electionId}?token=${token}`;

    await prisma.sHEElectionVoter.create({
      data: {
        electionId,
        email: email || null,
        phone: phone || null,
        voteToken: token,
      },
    });

    created.push({ email: email || undefined, phone: phone || undefined, voteUrl, token });
  }

  return NextResponse.json({ created, count: created.length }, { status: 201 });
}
