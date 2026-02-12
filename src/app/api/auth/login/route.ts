import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const BOOTSTRAP_SUPER_USERS: { email: string; password: string }[] = [
  { email: "erichvandenheuvel5@gmail.com", password: "vandenHeuvel97!" },
  { email: "demouser1@gmail.com", password: "DemoUser1" },
];

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Bootstrap: ensure super users exist when logging in with a bootstrap email.
    const bootstrap = BOOTSTRAP_SUPER_USERS.find((u) => u.email === email);
    if (bootstrap) {
      let superUser = await prisma.user.findUnique({
        where: { email: bootstrap.email },
      });
      if (!superUser) {
        const hashed = await bcrypt.hash(bootstrap.password, 10);
        superUser = await prisma.user.create({
          data: {
            email: bootstrap.email,
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
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set("role", user.role, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Login error:", err);
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as Error).message)
        : "Login failed";
    return Response.json(
      { error: `Login failed: ${message}` },
      { status: 500 }
    );
  }
}

