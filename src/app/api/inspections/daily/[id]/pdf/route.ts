import { NextResponse } from "next/server";

// Compatibility wrapper that now delegates to the unified /api/pdf endpoint.
// This keeps existing links working while centralising PDF generation logic.
export async function GET(_req: Request, context: any) {
  const { id } = context.params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const targetUrl = `${baseUrl}/api/pdf?type=daily-inspection&id=${encodeURIComponent(
    id
  )}`;

  return NextResponse.redirect(targetUrl);
}

