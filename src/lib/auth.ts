import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type CurrentUser = {
  id: string;
  email: string;
  role: "user" | "admin" | "super";
  companyId: string | null;
  companyName: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session },
    include: { company: true },
  });

  if (!user) return null;

  const role = (user.role || "user") as CurrentUser["role"];

  return {
    id: user.id,
    email: user.email,
    role,
    companyId: user.companyId ?? null,
    companyName: user.company?.name ?? null,
  };
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
  if (user.role !== "admin" && user.role !== "super") {
    throw new Error("Forbidden");
  }
  return user;
}

