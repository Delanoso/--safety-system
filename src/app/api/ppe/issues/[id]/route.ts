import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

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

  // Public access via signing token
  if (token != null && issue.signToken !== token) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 403 });
  }

  if (token == null) {
    // Internal access requires authenticated user with matching company (unless super)
    let current;
    try {
      current = await requireUser();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      current.role !== "super" &&
      issue.itemType.companyId != null &&
      issue.itemType.companyId !== current.companyId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(issue);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = new URL(req.url).searchParams.get("token");
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

  if (token != null) {
    if (issue.signToken !== token) {
      return NextResponse.json({ error: "Invalid or expired link." }, { status: 403 });
    }
  } else {
    let current;
    try {
      current = await requireUser();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      current.role !== "super" &&
      issue.itemType.companyId != null &&
      issue.itemType.companyId !== current.companyId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
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
