import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrSuper } from "@/lib/auth";

export async function GET() {
  const current = await requireAdminOrSuper();

  if (!current.companyId) {
    return NextResponse.json(
      { error: "Current user is not associated with a company" },
      { status: 400 }
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: current.companyId },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Company not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: company.id,
    name: company.name,
    logoUrl: company.logoUrl,
  });
}

export async function PATCH(req: Request) {
  const current = await requireAdminOrSuper();
  const body = await req.json();

  const { logoUrl, companyId } = body as {
    logoUrl?: string;
    companyId?: string;
  };

  if (!logoUrl) {
    return NextResponse.json(
      { error: "logoUrl is required" },
      { status: 400 }
    );
  }

  let targetCompanyId: string | null = null;

  if (current.role === "admin") {
    targetCompanyId = current.companyId;
  } else if (current.role === "super") {
    targetCompanyId = companyId ?? current.companyId ?? null;
  }

  if (!targetCompanyId) {
    return NextResponse.json(
      { error: "Unable to determine which company to update" },
      { status: 400 }
    );
  }

  const updated = await prisma.company.update({
    where: { id: targetCompanyId },
    data: { logoUrl },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    logoUrl: updated.logoUrl,
  });
}

