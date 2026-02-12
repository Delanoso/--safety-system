import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await prisma.riskAssessment.findFirst({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    title,
    department,
    location,
    assessor,
    riskLevel,
    reviewDate,
    controls,
    fileUrl,
    signature,
    status,
  } = body;

  const result = await prisma.riskAssessment.updateMany({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
    data: {
      ...(title != null && { title: String(title).trim() }),
      ...(department != null && { department: department ? String(department).trim() : null }),
      ...(location != null && { location: location ? String(location).trim() : null }),
      ...(assessor != null && { assessor: assessor ? String(assessor).trim() : null }),
      ...(riskLevel != null && { riskLevel: String(riskLevel).trim() }),
      ...(reviewDate != null && { reviewDate: reviewDate ? new Date(reviewDate) : null }),
      ...(controls != null && { controls: controls ? String(controls).trim() : null }),
      ...(fileUrl != null && { fileUrl: fileUrl ? String(fileUrl).trim() : null }),
      ...(signature != null && { signature: signature ? String(signature) : null }),
      ...(signature &&
        typeof signature === "string" && { signedAt: new Date(), status: "signed" }),
      ...(status != null &&
        !body.signature && { status: String(status) }),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.riskAssessment.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.riskAssessment.deleteMany({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
