import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // One-time bootstrap: if there are no users yet, create the initial super user.
  // NOTE: This is for development/bootstrap only and should be removed or secured for production.
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    const bootstrapEmail = "erichvandenheuvel5@gmail.com";
    const bootstrapPassword = "vandenHeuvel97!";

    const existingBootstrap = await prisma.user.findUnique({
      where: { email: bootstrapEmail },
    });

    if (!existingBootstrap) {
      const hashed = await bcrypt.hash(bootstrapPassword, 10);
      await prisma.user.create({
        data: {
          email: bootstrapEmail,
          password: hashed,
          role: "super",
        },
      });
    }
  }

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

