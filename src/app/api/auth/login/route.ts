import { NextResponse } from "next/server";
import { Prisma } from "prisma-client-generated";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const BOOTSTRAP_SUPER_USERS: { email: string; password: string }[] = [
  { email: "erichvandenheuvel5@gmail.com", password: "vandenHeuvel97!" },
  { email: "demouser1@gmail.com", password: "DemoUser1" },
];

/** Fetch user by email using only columns that exist before allowedModules/inspectionDepartments migrations. */
async function findUserByEmailRaw(email: string): Promise<{ id: string; email: string; password: string; role: string } | null> {
  const rows = await prisma.$queryRaw<
    { id: string; email: string; password: string; role: string }[]
  >(Prisma.sql`SELECT id, email, password, role FROM "User" WHERE email = ${email} LIMIT 1`);
  return rows[0] ?? null;
}

/** Create a user with only base columns (for bootstrap when DB is missing new columns). */
async function createUserRaw(data: { id: string; email: string; password: string; role: string }): Promise<void> {
  await prisma.$executeRaw(
    Prisma.sql`INSERT INTO "User" (id, email, password, role, "createdAt") VALUES (${data.id}, ${data.email}, ${data.password}, ${data.role}, CURRENT_TIMESTAMP)`
  );
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    let user: { id: string; email: string; password: string; role: string } | null = null;

    try {
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
        user = { id: superUser.id, email: superUser.email, password: superUser.password, role: superUser.role };
      } else {
        const found = await prisma.user.findUnique({ where: { email } });
        if (found) user = { id: found.id, email: found.email, password: found.password, role: found.role };
      }
    } catch (err) {
      // DB may be missing User.allowedModules / inspectionDepartments columns; use raw queries.
      const bootstrap = BOOTSTRAP_SUPER_USERS.find((u) => u.email === email);
      if (bootstrap) {
        let superUser = await findUserByEmailRaw(bootstrap.email);
        if (!superUser) {
          const hashed = await bcrypt.hash(bootstrap.password, 10);
          const id = randomUUID();
          await createUserRaw({
            id,
            email: bootstrap.email,
            password: hashed,
            role: "super",
          });
          superUser = { id, email: bootstrap.email, password: hashed, role: "super" };
        }
        user = superUser;
      } else {
        user = await findUserByEmailRaw(email);
      }
    }

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

    const res = NextResponse.json({ success: true });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
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

