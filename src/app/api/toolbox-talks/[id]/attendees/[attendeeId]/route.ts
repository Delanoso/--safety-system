import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertCompanyAccess } from "@/lib/site-safety-api";
import { attendeeDisplayName } from "@/lib/toolbox-talk-attendees";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; attendeeId: string }> }
) {
  try {
    const { id, attendeeId } = await context.params;
    const token = new URL(req.url).searchParams.get("token");

    const attendee = await prisma.toolboxTalkAttendee.findUnique({
      where: { id: attendeeId },
      include: {
        talk: {
          select: {
            id: true,
            title: true,
            talkDate: true,
            topic: true,
            companyId: true,
          },
        },
      },
    });

    if (!attendee || attendee.talkId !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (token) {
      if (!attendee.signToken || attendee.signToken !== token) {
        return NextResponse.json({ error: "Invalid or expired signing link" }, { status: 403 });
      }
      return NextResponse.json({
        id: attendee.id,
        name: attendeeDisplayName(attendee),
        signed: Boolean(attendee.signature),
        talk: {
          id: attendee.talk.id,
          title: attendee.talk.title,
          topic: attendee.talk.topic,
          talkDate: attendee.talk.talkDate,
        },
      });
    }

    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    assertCompanyAccess(current, attendee.talk.companyId);

    return NextResponse.json(attendee);
  } catch (err) {
    if ((err as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to load attendee" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; attendeeId: string }> }
) {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, attendeeId } = await context.params;

    const attendee = await prisma.toolboxTalkAttendee.findUnique({
      where: { id: attendeeId },
      include: { talk: { select: { id: true, companyId: true } } },
    });
    if (!attendee || attendee.talkId !== id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    assertCompanyAccess(current, attendee.talk.companyId);

    await prisma.toolboxTalkAttendee.delete({ where: { id: attendeeId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((err as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to remove attendee" }, { status: 500 });
  }
}
