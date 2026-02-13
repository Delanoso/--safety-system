import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_USERS = [
  { email: "erichvandenheuvel5@gmail.com", password: "vandenHeuvel97!", role: "super" as const },
  { email: "demouser1@gmail.com", password: "DemoUser1", role: "super" as const },
];

async function main() {
  // Users
  for (const u of SEED_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const hashed = await bcrypt.hash(u.password, 10);
      await prisma.user.create({
        data: { email: u.email, password: hashed, role: u.role },
      });
      console.log(`Created user: ${u.email}`);
    }
  }

  // Demo documents for dashboard stats (one of each)
  const user = await prisma.user.findFirst();
  if (!user) return;

  const now = new Date();

  if ((await prisma.incident.count()) === 0) {
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
    console.log("Created demo incident");
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
    console.log("Created demo appointment (unsigned)");
  }

  if ((await prisma.certificate.count()) === 0) {
    const expiringSoon = new Date(now);
    expiringSoon.setDate(expiringSoon.getDate() + 20);
    await prisma.certificate.create({
      data: {
        employee: "Demo Employee",
        certificateName: "First Aid Level 1",
        certificateType: "Safety",
        issueDate: now,
        expiryDate: expiringSoon,
      },
    });
    console.log("Created demo certificate (expires in 20 days)");
  }

  if ((await prisma.medical.count()) === 0) {
    const expiringSoon = new Date(now);
    expiringSoon.setDate(expiringSoon.getDate() + 15);
    await prisma.medical.create({
      data: {
        employee: "Demo Employee",
        medicalType: "Baseline Medical",
        issueDate: now,
        expiryDate: expiringSoon,
      },
    });
    console.log("Created demo medical (expires in 15 days)");
  }

  if ((await prisma.pPEItemType.count()) === 0) {
    const itemType = await prisma.pPEItemType.create({
      data: { name: "Safety Boots" },
    });
    await prisma.pPEStock.create({
      data: { itemTypeId: itemType.id, quantity: 3 },
    });
    console.log("Created demo PPE item type + stock (low stock: 3)");
  }

  if ((await prisma.pPEPerson.count()) === 0) {
    await prisma.pPEPerson.create({
      data: { name: "Demo Person", department: "Operations" },
    });
    console.log("Created demo PPE person");
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
      console.log("Created demo PPE issue (awaiting signature)");
    }
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
