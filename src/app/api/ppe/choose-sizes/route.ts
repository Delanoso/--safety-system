import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
  }

  const record = await prisma.pPESizeReminderToken.findUnique({
    where: { token },
    include: {
      person: {
        include: {
          subDepartmentRelation: {
            include: {
              ppeItemTypes: { include: { itemType: true } },
            },
          },
        },
      },
    },
  });

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 404 });
  }
  if (record.usedAt) {
    return NextResponse.json({ error: "This link has already been used." }, { status: 400 });
  }
  if (new Date() > record.expiresAt) {
    return NextResponse.json({ error: "This link has expired." }, { status: 400 });
  }

  const items =
    record.person.subDepartmentRelation?.ppeItemTypes?.map((x) => ({
      id: x.itemType.id,
      name: x.itemType.name,
    })) ?? [];

  return NextResponse.json({
    personName: record.person.name,
    items,
  });
}

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const token = data.token != null ? String(data.token).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
  }

  const record = await prisma.pPESizeReminderToken.findUnique({
    where: { token },
    include: { person: true },
  });

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 404 });
  }
  if (record.usedAt) {
    return NextResponse.json({ error: "This link has already been used." }, { status: 400 });
  }
  if (new Date() > record.expiresAt) {
    return NextResponse.json({ error: "This link has expired." }, { status: 400 });
  }

  const sizes = data.sizes;
  const sizesObj =
    sizes != null && typeof sizes === "object" && !Array.isArray(sizes)
      ? Object.fromEntries(
          Object.entries(sizes).filter(
            (entry): entry is [string, string] =>
              typeof entry[0] === "string" && typeof entry[1] === "string"
          )
        )
      : {};
  const sizesJson = Object.keys(sizesObj).length > 0 ? JSON.stringify(sizesObj) : null;

  await prisma.$transaction([
    prisma.pPEPerson.update({
      where: { id: record.personId },
      data: { sizes: sizesJson },
    }),
    prisma.pPESizeReminderToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}
