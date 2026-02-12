import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
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
  const token = data.token != null ? String(data.token) : null;
  const signature = data.signature != null ? String(data.signature) : null;
  if (!token || !signature) {
    return NextResponse.json(
      { error: "Token and signature are required." },
      { status: 400 }
    );
  }

  const issue = await prisma.pPEIssue.findUnique({
    where: { id: Number(id) },
    include: { person: true, itemType: true },
  });
  if (!issue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (issue.signToken !== token) {
    return NextResponse.json(
      { error: "Invalid or expired signing link." },
      { status: 403 }
    );
  }
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

  return NextResponse.json({ ok: true });
}
