import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPublicBaseUrl } from "@/lib/public-base-url";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function generateToken() {
  return crypto.randomUUID();
}

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const personId = data.personId != null ? Number(data.personId) : null;
  if (personId == null || !Number.isInteger(personId) || personId < 1) {
    return NextResponse.json({ error: "Valid personId is required." }, { status: 400 });
  }

  const person = await prisma.pPEPerson.findUnique({
    where: { id: personId },
    include: { subDepartmentRelation: true },
  });
  if (!person) return NextResponse.json({ error: "Person not found." }, { status: 404 });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.pPESizeReminderToken.create({
    data: { personId, token, expiresAt },
  });

  const baseUrl = getPublicBaseUrl(req);
  const chooseSizesPath = "/ppe-management/choose-sizes";
  const link = `${baseUrl}${chooseSizesPath}?token=${token}`;

  return NextResponse.json({
    token,
    link,
    expiresAt: expiresAt.toISOString(),
    personName: person.name,
    phone: person.phone,
  });
}
