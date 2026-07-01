import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertCompanyAccess } from "@/lib/site-safety-api";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;
    const talk = await prisma.toolboxTalk.findUnique({
      where: { id },
      include: { attendees: { orderBy: { createdAt: "asc" } } },
    });
    if (!talk) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertCompanyAccess(current, talk.companyId);
    return NextResponse.json(talk);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((err as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to load toolbox talk" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
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
    await prisma.toolboxTalk.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((err as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
