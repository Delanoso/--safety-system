import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrSuper } from "@/lib/auth";

async function resolveTargetCompanyId(
  current: Awaited<ReturnType<typeof requireAdminOrSuper>>,
  companyId?: string
) {
  if (current.role === "admin") return current.companyId;
  if (current.role === "super") return companyId ?? current.companyId ?? null;
  return null;
}

export async function GET(req: Request) {
  const current = await requireAdminOrSuper();
  const url = new URL(req.url);
  const companyIdParam = url.searchParams.get("companyId") ?? undefined;

  const targetCompanyId = await resolveTargetCompanyId(current, companyIdParam);
  if (!targetCompanyId) {
    return NextResponse.json(
      { error: "Unable to determine which company to load" },
      { status: 400 }
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: targetCompanyId },
    select: { id: true, name: true, logoUrl: true, brandColor: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json(company);
}

export async function PATCH(req: Request) {
  const current = await requireAdminOrSuper();
  const body = await req.json();

  const { name, brandColor, companyId } = body as {
    name?: string;
    brandColor?: string | null;
    companyId?: string;
  };

  const targetCompanyId = await resolveTargetCompanyId(current, companyId);
  if (!targetCompanyId) {
    return NextResponse.json(
      { error: "Unable to determine which company to update" },
      { status: 400 }
    );
  }

  const data: { name?: string; brandColor?: string | null } = {};

  if (name !== undefined) {
    const trimmed = name.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "Company name cannot be empty" },
        { status: 400 }
      );
    }
    data.name = trimmed;
  }

  if (brandColor !== undefined) {
    const trimmed = brandColor?.trim() ?? "";
    if (trimmed && !/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
      return NextResponse.json(
        { error: "Brand colour must be a hex value like #1e40af" },
        { status: 400 }
      );
    }
    data.brandColor = trimmed || null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 }
    );
  }

  const updated = await prisma.company.update({
    where: { id: targetCompanyId },
    data,
    select: { id: true, name: true, logoUrl: true, brandColor: true },
  });

  return NextResponse.json(updated);
}
