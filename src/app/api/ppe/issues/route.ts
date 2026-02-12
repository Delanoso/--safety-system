import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const issues = await prisma.pPEIssue.findMany({
    orderBy: { createdAt: "desc" },
    include: { person: true, itemType: true },
  });
  return NextResponse.json(issues);
}

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const personId = Number(data.personId);
  const itemTypeId = Number(data.itemTypeId);
  const quantity = Number(data.quantity) || 1;
  if (!Number.isInteger(personId) || !Number.isInteger(itemTypeId) || quantity < 1) {
    return NextResponse.json(
      { error: "Valid personId, itemTypeId, and positive quantity required." },
      { status: 400 }
    );
  }
  const issue = await prisma.pPEIssue.create({
    data: {
      personId,
      itemTypeId,
      quantity,
      status: "pending_signature",
    },
    include: { person: true, itemType: true },
  });
  return NextResponse.json(issue);
}
