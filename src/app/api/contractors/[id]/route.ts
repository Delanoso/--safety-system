import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computeContractorCompliance, parseExcludedSections } from "@/lib/contractor-compliance";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await prisma.contractor.findFirst({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
    include: { documents: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const compliance = computeContractorCompliance(item.documents, item.excludedSections);
  return NextResponse.json({ ...item, compliance });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, contactEmail, contactPhone, scope, jobDescription, excludedSections } = body;

  const excludedData =
    excludedSections !== undefined
      ? {
          excludedSections: (() => {
            const parsed = parseExcludedSections(excludedSections);
            return parsed.length > 0 ? JSON.stringify(parsed) : null;
          })(),
        }
      : {};

  const result = await prisma.contractor.updateMany({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
    data: {
      ...(name != null && { name: String(name).trim() }),
      ...(contactEmail != null && { contactEmail: contactEmail ? String(contactEmail).trim() : null }),
      ...(contactPhone != null && { contactPhone: contactPhone ? String(contactPhone).trim() : null }),
      ...(scope != null && { scope: scope === "specific_job" ? "specific_job" : "ongoing" }),
      ...(jobDescription != null && { jobDescription: jobDescription ? String(jobDescription).trim() : null }),
      ...excludedData,
    },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.contractor.findUnique({
    where: { id },
    include: { documents: true },
  });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const compliance = computeContractorCompliance(updated.documents, updated.excludedSections);
  return NextResponse.json({ ...updated, compliance });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.contractor.deleteMany({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
