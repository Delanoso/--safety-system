import { Prisma } from "prisma-client-generated";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type CurrentUser = {
  id: string;
  email: string;
  role: "user" | "admin" | "super";
  companyId: string | null;
  companyName: string | null;
  /** If null or empty, user has full access. Otherwise only these module slugs are allowed. */
  allowedModules: string[] | null;
  /** Department names for inspections. Users in the same department share access to that department's inspections. */
  inspectionDepartments: string[] | null;
};

/** Fetch user by id with only base columns (for when DB is missing allowedModules/inspectionDepartments). */
async function getCurrentUserRaw(
  session: string
): Promise<CurrentUser | null> {
  const rows = await prisma.$queryRaw<
    { id: string; email: string; role: string; companyId: string | null; companyName: string | null }[]
  >(
    Prisma.sql`
      SELECT u.id, u.email, u.role, u."companyId", c.name AS "companyName"
      FROM "User" u
      LEFT JOIN "Company" c ON u."companyId" = c.id
      WHERE u.id = ${session}
      LIMIT 1
    `
  );
  const row = rows[0];
  if (!row) return null;
  const role = (row.role || "user") as CurrentUser["role"];
  return {
    id: row.id,
    email: row.email,
    role,
    companyId: row.companyId ?? null,
    companyName: row.companyName ?? null,
    allowedModules: null,
    inspectionDepartments: null,
  };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session },
      include: { company: true },
    });

    if (!user) return null;

    const role = (user.role || "user") as CurrentUser["role"];

    let allowedModules: string[] | null = null;
    if (user.allowedModules != null && user.allowedModules.trim() !== "") {
      try {
        const parsed = JSON.parse(user.allowedModules) as unknown;
        allowedModules = Array.isArray(parsed)
          ? parsed.filter((x): x is string => typeof x === "string")
          : null;
      } catch {
        allowedModules = null;
      }
    }

    let inspectionDepartments: string[] | null = null;
    if (user.inspectionDepartments != null && user.inspectionDepartments.trim() !== "") {
      try {
        const parsed = JSON.parse(user.inspectionDepartments) as unknown;
        inspectionDepartments = Array.isArray(parsed)
          ? parsed.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean)
          : null;
      } catch {
        inspectionDepartments = null;
      }
    }

    return {
      id: user.id,
      email: user.email,
      role,
      companyId: user.companyId ?? null,
      companyName: user.company?.name ?? null,
      allowedModules,
      inspectionDepartments,
    };
  } catch {
    return getCurrentUserRaw(session);
  }
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdminOrSuper(): Promise<CurrentUser> {
  const user = await requireUser();
  const role = (user.role ?? "").toLowerCase();
  if (role !== "admin" && role !== "super") {
    throw new Error("Forbidden");
  }
  return user;
}

