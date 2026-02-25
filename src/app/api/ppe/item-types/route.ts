import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const where =
    current.role !== "super" && current.companyId != null
      ? { companyId: current.companyId }
      : undefined;
  const types = await prisma.pPEItemType.findMany({
    where,
    orderBy: { name: "asc" },
    include: { stock: true },
  });
  return NextResponse.json(types);
}

export async function POST(req: Request) {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const companyId =
    current.role === "super" ? null : current.companyId ?? null;
  if (current.role !== "super" && !companyId) {
    return NextResponse.json(
      { error: "No company associated with your account." },
      { status: 400 }
    );
  }
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const name = String(data.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Item name is required." }, { status: 400 });
  }
  try {
    const itemType = await prisma.pPEItemType.create({
      data: { name, companyId },
    });
    await prisma.pPEStock.create({
      data: { itemTypeId: itemType.id, quantity: 0 },
    });
    const withStock = await prisma.pPEItemType.findUnique({
      where: { id: itemType.id },
      include: { stock: true },
    });
    return NextResponse.json(withStock ?? itemType);
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const isSchemaError =
      /column.*(minStockThreshold|reorderLevel|allowedModules|inspectionDepartments).*does not exist/i.test(raw) ||
      /P2022/i.test(String((err as { code?: string })?.code));
    const message = isSchemaError
      ? "Database schema is out of date. Run: npx prisma migrate deploy"
      : raw || "Failed to create item type.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
