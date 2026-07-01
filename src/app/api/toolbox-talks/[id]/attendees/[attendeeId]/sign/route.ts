import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertCompanyAccess } from "@/lib/site-safety-api";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string; attendeeId: string }> }
) {
  try {
    const { id, attendeeId } = await context.params;
    const data = await req.json();
    const signature = data.signature != null ? String(data.signature).trim() : "";
    const token = data.token != null ? String(data.token).trim() : "";

    if (!signature || !signature.startsWith("data:image")) {
      return NextResponse.json({ error: "A valid signature is required." }, { status: 400 });
    }

    const attendee = await prisma.toolboxTalkAttendee.findUnique({
      where: { id: attendeeId },
      include: { talk: { select: { id: true, companyId: true } } },
    });

    if (!attendee || attendee.talkId !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (attendee.signature) {
      return NextResponse.json({ error: "Already signed." }, { status: 400 });
    }

    if (token) {
      if (!attendee.signToken || attendee.signToken !== token) {
        return NextResponse.json({ error: "Invalid or expired signing link." }, { status: 403 });
      }
    } else {
      const current = await getCurrentUser();
      if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      assertCompanyAccess(current, attendee.talk.companyId);
    }

    const updated = await prisma.toolboxTalkAttendee.update({
      where: { id: attendeeId },
      data: {
        signature,
        signedAt: new Date(),
        signToken: null,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((err as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Toolbox attendee sign:", err);
    return NextResponse.json({ error: "Failed to save signature" }, { status: 500 });
  }
}
