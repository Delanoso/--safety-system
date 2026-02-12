import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  if (!token) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  const contractor = await prisma.contractor.findUnique({
    where: { uploadToken: token },
    include: { documents: true },
  });
  if (!contractor) return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });

  return NextResponse.json({
    id: contractor.id,
    name: contractor.name,
    scope: contractor.scope,
    jobDescription: contractor.jobDescription,
    documents: contractor.documents,
  });
}
