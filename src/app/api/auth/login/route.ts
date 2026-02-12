import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const BOOTSTRAP_SUPER_EMAIL = "erichvandenheuvel5@gmail.com";
const BOOTSTRAP_SUPER_PASSWORD = "vandenHeuvel97!";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Bootstrap: ensure the super user exists when logging in with the bootstrap email.
  // If you try to log in with that email and the user doesn't exist, we create them.
  // NOTE: For production, remove or restrict this (e.g. only when no users exist).
  if (email === BOOTSTRAP_SUPER_EMAIL) {
    let superUser = await prisma.user.findUnique({
      where: { email: BOOTSTRAP_SUPER_EMAIL },
    });
    if (!superUser) {
      const hashed = await bcrypt.hash(BOOTSTRAP_SUPER_PASSWORD, 10);
      superUser = await prisma.user.create({
        data: {
          email: BOOTSTRAP_SUPER_EMAIL,
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

  // Use secure cookies only in production so login works on http://localhost
  const isSecure = process.env.NODE_ENV === "production";

  const cookieStore = await cookies();
  cookieStore.set("session", user.id, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "strict",
    path: "/",
  });

  cookieStore.set("role", user.role, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "strict",
    path: "/",
  });

  return Response.json({ success: true });
}

