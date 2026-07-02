import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prepareWhatsAppDelivery, whatsAppLinkLine } from "@/lib/whatsapp";
import { getPublicBaseUrl } from "@/lib/public-base-url";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function generateToken() {
  return crypto.randomUUID();
}

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

  const phone = data.phone != null ? String(data.phone).trim() : "";
  if (!phone) {
    return NextResponse.json(
      { error: "Phone number is required to send the signing link via WhatsApp." },
      { status: 400 }
    );
  }

  const issue = await prisma.pPEIssue.findUnique({
    where: { id: Number(id) },
    include: { person: true, itemType: true },
  });
  if (!issue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (issue.status === "signed") {
    return NextResponse.json({ error: "This issue is already signed." }, { status: 400 });
  }

  const token = generateToken();
  const baseUrl = getPublicBaseUrl(req);
  const signUrl = `${baseUrl}/ppe-management/sign/${id}?token=${token}`;

  await prisma.pPEIssue.update({
    where: { id: Number(id) },
    data: { signToken: token },
  });

  const message = `Hi ${issue.person.name}, you have been issued ${issue.quantity} x ${issue.itemType.name}. Please confirm by signing:${whatsAppLinkLine(signUrl)}`;

  let delivery;
  try {
    delivery = prepareWhatsAppDelivery(phone, message);
  } catch {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    signUrl,
    whatsappUrl: delivery.whatsappUrl,
    message: "Open WhatsApp to send the signing link.",
  });
}

