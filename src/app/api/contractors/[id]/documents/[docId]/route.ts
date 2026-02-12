import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contractor = await prisma.contractor.findFirst({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (!contractor) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await prisma.contractorDocument.deleteMany({
    where: { id: docId, contractorId: id },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
