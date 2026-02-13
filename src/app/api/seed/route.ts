import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Bootstrap demo users if none exist. Safe to call multiple times.
 * Hit this URL once after deploying if login fails: /api/seed
 *
 * Add ?demo=1 to also create one of each document for dashboard stats:
 * /api/seed?demo=1
 */
const SEED_USERS = [
  { email: "erichvandenheuvel5@gmail.com", password: "vandenHeuvel97!", role: "super" as const },
  { email: "demouser1@gmail.com", password: "DemoUser1", role: "super" as const },
];

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const addDemo = searchParams.get("demo") === "1";

    const created: string[] = [];
    for (const u of SEED_USERS) {
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (!existing) {
        const hashed = await bcrypt.hash(u.password, 10);
        await prisma.user.create({
          data: { email: u.email, password: hashed, role: u.role },
        });
        created.push(u.email);
      }
    }

    const demoCreated: string[] = [];
    if (addDemo) {
      const user = await prisma.user.findFirst();
      const now = new Date();

      if (user && (await prisma.incident.count()) === 0) {
        await prisma.incident.create({
          data: {
            type: "incident",
            title: "Sample Incident",
            description: "Demo incident for stats",
            department: "Operations",
            date: now,
            severity: "medium",
            status: "draft",
            createdByUserId: user.id,
          },
        });
        demoCreated.push("incident");
      }

      if ((await prisma.appointment.count()) === 0) {
        await prisma.appointment.create({
          data: {
            type: "Health and Safety Representative",
            appointee: "Jane Doe",
            appointer: "John Smith",
            department: "Safety",
            date: now,
            status: "draft",
          },
        });
        demoCreated.push("appointment");
      }

      if ((await prisma.certificate.count()) === 0) {
        const exp = new Date(now);
        exp.setDate(exp.getDate() + 20);
        await prisma.certificate.create({
          data: {
            employee: "Demo Employee",
            certificateName: "First Aid Level 1",
            certificateType: "Safety",
            issueDate: now,
            expiryDate: exp,
          },
        });
        demoCreated.push("certificate");
      }

      if ((await prisma.medical.count()) === 0) {
        const exp = new Date(now);
        exp.setDate(exp.getDate() + 15);
        await prisma.medical.create({
          data: {
            employee: "Demo Employee",
            medicalType: "Baseline Medical",
            issueDate: now,
            expiryDate: exp,
          },
        });
        demoCreated.push("medical");
      }

      if ((await prisma.pPEItemType.count()) === 0) {
        const itemType = await prisma.pPEItemType.create({
          data: { name: "Safety Boots" },
        });
        await prisma.pPEStock.create({
          data: { itemTypeId: itemType.id, quantity: 3 },
        });
        demoCreated.push("ppe_stock");
      }

      if ((await prisma.pPEPerson.count()) === 0) {
        await prisma.pPEPerson.create({
          data: { name: "Demo Person", department: "Operations" },
        });
        demoCreated.push("ppe_person");
      }

      if ((await prisma.pPEIssue.count()) === 0) {
        const person = await prisma.pPEPerson.findFirst();
        const itemType = await prisma.pPEItemType.findFirst();
        if (person && itemType) {
          await prisma.pPEIssue.create({
            data: {
              personId: person.id,
              itemTypeId: itemType.id,
              quantity: 1,
              status: "pending_signature",
            },
          });
          demoCreated.push("ppe_issue");
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        created.length > 0 || demoCreated.length > 0
          ? "Seed complete"
          : "Data already exists",
      created,
      demoCreated,
      userCount: await prisma.user.count(),
    });
  } catch (err) {
    console.error("Seed failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
