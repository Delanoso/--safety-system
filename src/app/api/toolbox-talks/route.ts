import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  companyWhere,
  companyIdForCreate,
  trimOrNull,
  parseDate,
} from "@/lib/site-safety-api";
import { attendeeToCreateData, parseAttendeeInput } from "@/lib/toolbox-talk-attendees";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const current = await requireUser();
    const talks = await prisma.toolboxTalk.findMany({
      where: companyWhere(current),
      include: { attendees: true },
      orderBy: { talkDate: "desc" },
    });
    return NextResponse.json(talks);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Toolbox talks list:", err);
    const message = err instanceof Error ? err.message : "Failed to load toolbox talks";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const companyId = companyIdForCreate(current);
    if (current.role !== "super" && !companyId) {
      return NextResponse.json({ error: "No company associated with your account" }, { status: 400 });
    }

    const data = await req.json();
    const title = trimOrNull(data.title);
    const talkDate = parseDate(data.talkDate);
    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!talkDate) {
      return NextResponse.json({ error: "Talk date is required." }, { status: 400 });
    }

    const attendeeRows = Array.isArray(data.attendees)
      ? data.attendees.map(parseAttendeeInput).filter((a): a is NonNullable<typeof a> => a != null)
      : [];

    const talk = await prisma.toolboxTalk.create({
      data: {
        title,
        topic: trimOrNull(data.topic),
        department: trimOrNull(data.department),
        location: trimOrNull(data.location),
        presenter: trimOrNull(data.presenter),
        talkDate,
        durationMinutes:
          data.durationMinutes != null && data.durationMinutes !== ""
            ? Number(data.durationMinutes)
            : null,
        notes: trimOrNull(data.notes),
        fileUrl: trimOrNull(data.fileUrl),
        status: trimOrNull(data.status) ?? "completed",
        companyId,
        attendees: {
          create: attendeeRows.map(attendeeToCreateData),
        },
      },
      include: { attendees: true },
    });

    return NextResponse.json(talk);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Toolbox talk create:", err);
    return NextResponse.json({ error: "Failed to save toolbox talk" }, { status: 500 });
  }
}
