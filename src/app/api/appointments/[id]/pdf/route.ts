import { NextResponse } from "next/server";

// Redirect to print view (user saves via browser Print → Save as PDF).
// This keeps existing links working while centralising PDF generation logic.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const targetUrl = `${baseUrl}/pdf-renderer?type=appointment&id=${encodeURIComponent(
    id
  )}`;

  return NextResponse.redirect(targetUrl);
}

