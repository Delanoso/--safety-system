import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentUser, requireAdminOrSuper } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const current = await requireAdminOrSuper();
  const { id } = await context.params;

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (current.role === "admin" && targetUser.companyId !== current.companyId) {
    return NextResponse.json({ error: "You can only edit users in your company" }, { status: 403 });
  }

  if (current.role === "admin" && targetUser.role === "super") {
    return NextResponse.json({ error: "You cannot edit a super user" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const role = body.role as string | undefined;
  const allowedModules = body.allowedModules as string[] | null | undefined;
  const inspectionDepartments = body.inspectionDepartments as string[] | null | undefined;
  const password = body.password as string | undefined;

  const data: { role?: string; allowedModules?: string | null; inspectionDepartments?: string | null; password?: string } = {};

  if (role !== undefined) {
    if (current.role === "admin" && role === "super") {
      return NextResponse.json({ error: "Admins cannot set super role" }, { status: 403 });
    }
    if (["user", "admin", "super"].includes(role)) data.role = role;
  }

  if (allowedModules !== undefined) {
    if (allowedModules === null || (Array.isArray(allowedModules) && allowedModules.length === 0)) {
      data.allowedModules = null;
    } else if (Array.isArray(allowedModules)) {
      data.allowedModules = JSON.stringify(allowedModules.filter((x) => typeof x === "string"));
    }
  }

  if (inspectionDepartments !== undefined) {
    if (inspectionDepartments === null || (Array.isArray(inspectionDepartments) && inspectionDepartments.length === 0)) {
      data.inspectionDepartments = null;
    } else if (Array.isArray(inspectionDepartments)) {
      const list = inspectionDepartments.filter((x) => typeof x === "string").map((s) => String(s).trim()).filter(Boolean);
      data.inspectionDepartments = list.length > 0 ? JSON.stringify(list) : null;
    }
  }

  if (password !== undefined && typeof password === "string" && password.length > 0) {
    data.password = await bcrypt.hash(password, 10);
  }

  if (Object.keys(data).length === 0) {
    const u = await prisma.user.findUnique({
      where: { id },
      include: { company: true },
    });
    return NextResponse.json({
      id: u?.id,
      email: u?.email,
      role: u?.role,
      companyId: u?.companyId,
      companyName: u?.company?.name ?? null,
      allowedModules: u?.allowedModules ? (JSON.parse(u.allowedModules) as string[]) : null,
      inspectionDepartments: u?.inspectionDepartments ? (JSON.parse(u.inspectionDepartments) as string[]) : [],
    });
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    include: { company: true },
  });

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    role: updated.role,
    companyId: updated.companyId,
    companyName: updated.company?.name ?? null,
    allowedModules: updated.allowedModules ? (JSON.parse(updated.allowedModules) as string[]) : null,
    inspectionDepartments: updated.inspectionDepartments ? (JSON.parse(updated.inspectionDepartments) as string[]) : [],
  });
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  if (current.role === "user" && current.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { company: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (current.role === "admin" && user.companyId !== current.companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    companyName: user.company?.name ?? null,
    allowedModules: user.allowedModules ? (JSON.parse(user.allowedModules) as string[]) : null,
    inspectionDepartments: user.inspectionDepartments ? (JSON.parse(user.inspectionDepartments) as string[]) : [],
  });
}
