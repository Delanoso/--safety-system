import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = new URL(req.url).searchParams.get("token");
  const issue = await prisma.pPEIssue.findUnique({
    where: { id: Number(id) },
    include: { person: true, itemType: true },
  });
  if (!issue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (token != null && issue.signToken !== token) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 403 });
  }
  return NextResponse.json(issue);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const signature = data.signature != null ? String(data.signature) : null;
  if (!signature) {
    return NextResponse.json({ error: "Signature is required." }, { status: 400 });
  }

  const issue = await prisma.pPEIssue.findUnique({
    where: { id: Number(id) },
    include: { itemType: true },
  });
  if (!issue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (issue.status === "signed") {
    return NextResponse.json({ error: "Already signed." }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.pPEIssue.update({
      where: { id: Number(id) },
      data: {
        signature,
        signedAt: new Date(),
        signToken: null,
        status: "signed",
      },
    });
    const stock = await tx.pPEStock.findUnique({
      where: { itemTypeId: issue.itemTypeId },
    });
    if (stock) {
      const newQty = Math.max(0, stock.quantity - issue.quantity);
      await tx.pPEStock.update({
        where: { itemTypeId: issue.itemTypeId },
        data: { quantity: newQty },
      });
    }
  });

  const updated = await prisma.pPEIssue.findUnique({
    where: { id: Number(id) },
    include: { person: true, itemType: true },
  });
  return NextResponse.json(updated);
}
