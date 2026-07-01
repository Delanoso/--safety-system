import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const target = new URL("/api/pdf", url.origin);
  target.searchParams.set("type", "daily-inspection");
  target.searchParams.set("id", id);
  return NextResponse.redirect(target);
}

