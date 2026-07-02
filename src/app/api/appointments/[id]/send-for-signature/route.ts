import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireUser } from "@/lib/auth";

import { prepareWhatsAppDelivery, whatsAppLinkLine } from "@/lib/whatsapp";
import { getPublicBaseUrl } from "@/lib/public-base-url";



function generateToken() {

  return crypto.randomUUID();

}



export async function POST(

  req: Request,

  context: { params: Promise<{ id: string }> }

) {

  try {

    const current = await requireUser();

    const { id } = await context.params;



    if (!id) {

      return NextResponse.json({ error: "Invalid appointment ID" }, { status: 400 });

    }



    const { phone, role, instructions } = await req.json();



    if (!phone?.trim()) {

      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });

    }



    if (!["appointer", "appointee"].includes(role)) {

      return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    }



    const appointment = await prisma.appointment.findUnique({

      where: { id },

    });



    if (!appointment) {

      return NextResponse.json({ error: "Not found" }, { status: 404 });

    }

    if (current.role !== "super" && appointment.companyId !== current.companyId) {

      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    }



    const token = generateToken();

    const tokenField = role === "appointer" ? "appointerToken" : "appointeeToken";

    const statusValue = role === "appointer" ? "pending_appointer" : "pending_appointee";



    const baseUrl = getPublicBaseUrl(req);

    const signUrl = `${baseUrl}/appointments/sign/${id}?role=${role}&token=${token}`;



    await prisma.appointment.update({

      where: { id },

      data: {

        [tokenField]: token,

        status: statusValue,

      },

    });



    const recipientName =

      role === "appointer" ? appointment.appointer : appointment.appointee;

    const instructionText =

      instructions && String(instructions).trim()

        ? `\n\nInstructions: ${String(instructions).trim()}`

        : "";



    const message = `Hi ${recipientName}, you have an appointment letter to sign. Please open this link:${whatsAppLinkLine(signUrl)}${instructionText}`;



    let delivery;

    try {

      delivery = prepareWhatsAppDelivery(String(phone).trim(), message);

    } catch {

      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });

    }



    return NextResponse.json({

      ok: true,

      whatsappUrl: delivery.whatsappUrl,

      signUrl,

    });

  } catch (err) {

    if (err instanceof Error && err.message === "Unauthorized") {

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    }

    console.error("SEND-FOR-SIGNATURE ERROR:", err);

    return NextResponse.json({ error: "Failed to send signature request" }, { status: 500 });

  }

}


