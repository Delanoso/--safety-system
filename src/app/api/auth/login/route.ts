import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // ⭐ SESSION COOKIE
  cookies().set("session", user.id, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  // ⭐ ROLE COOKIE
  cookies().set("role", user.role, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return Response.json({ success: true });
}

