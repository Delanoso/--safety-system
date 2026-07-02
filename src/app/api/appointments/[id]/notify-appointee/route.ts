import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireUser } from "@/lib/auth";

import { prepareWhatsAppDelivery } from "@/lib/whatsapp";
import { getPublicBaseUrl } from "@/lib/public-base-url";



export async function POST(

  req: Request,

  context: { params: Promise<{ id: string }> }

) {

  try {

    const current = await requireUser();

    const { id } = await context.params;

    const { appointeeToken, phone } = await req.json();



    const appointment = await prisma.appointment.findUnique({

      where: { id },

      select: {

        companyId: true,

        appointee: true,

        appointer: true,

        appointeeToken: true,

      },

    });



    if (!appointment) {

      return NextResponse.json({ error: "Not found" }, { status: 404 });

    }

    if (current.role !== "super" && appointment.companyId !== current.companyId) {

      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    }



    const phoneNumber = phone?.trim();

    if (!phoneNumber) {

      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });

    }



    const token = appointeeToken || appointment.appointeeToken;

    if (!token) {

      return NextResponse.json({ error: "Appointee signing token missing" }, { status: 400 });

    }



    const baseUrl = getPublicBaseUrl(req);

    const signUrl = `${baseUrl}/appointments/sign/${id}?role=appointee&token=${token}`;



    const message = `Hi ${appointment.appointee}, your appointer (${appointment.appointer}) has signed your appointment letter. Please review and sign: ${signUrl}`;



    let delivery;

    try {

      delivery = prepareWhatsAppDelivery(phoneNumber, message);

    } catch {

      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });

    }



    return NextResponse.json({ ok: true, whatsappUrl: delivery.whatsappUrl, signUrl });

  } catch (err) {

    if (err instanceof Error && err.message === "Unauthorized") {

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    }

    console.error("notify-appointee", err);

    return NextResponse.json({ error: "Failed to prepare WhatsApp message" }, { status: 500 });

  }

}


