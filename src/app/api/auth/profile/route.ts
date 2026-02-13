import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, notificationsEnabled: true },
  });
  if (!full) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    email: full.email,
    notificationsEnabled: full.notificationsEnabled ?? true,
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { email?: string; currentPassword?: string; newPassword?: string; notificationsEnabled?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: { email?: string; password?: string; notificationsEnabled?: boolean } = {};

  if (typeof body.notificationsEnabled === "boolean") {
    updates.notificationsEnabled = body.notificationsEnabled;
  }

  if (body.email && typeof body.email === "string" && body.email.trim()) {
    const trimmed = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email: trimmed } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    updates.email = trimmed;
  }

  if (body.newPassword && typeof body.newPassword === "string") {
    if (!body.currentPassword || typeof body.currentPassword !== "string") {
      return NextResponse.json(
        { error: "Current password is required to change password" },
        { status: 400 }
      );
    }
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const valid = await bcrypt.compare(body.currentPassword, dbUser.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }
    if (body.newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }
    updates.password = await bcrypt.hash(body.newPassword, 10);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid updates" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data: updates });
  return NextResponse.json({ success: true });
}
