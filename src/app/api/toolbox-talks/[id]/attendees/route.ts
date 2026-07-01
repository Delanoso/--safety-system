import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertCompanyAccess } from "@/lib/site-safety-api";
import { attendeeToCreateData, parseAttendeeInput } from "@/lib/toolbox-talk-attendees";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;
    const talk = await prisma.toolboxTalk.findUnique({
      where: { id },
      select: { companyId: true },
    });
    if (!talk) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertCompanyAccess(current, talk.companyId);

    const data = await req.json();
    const attendee = parseAttendeeInput(data);
    if (!attendee) {
      return NextResponse.json({ error: "First name is required." }, { status: 400 });
    }

    const created = await prisma.toolboxTalkAttendee.create({
      data: { talkId: id, ...attendeeToCreateData(attendee) },
    });

    return NextResponse.json(created);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((err as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to add attendee" }, { status: 500 });
  }
}
