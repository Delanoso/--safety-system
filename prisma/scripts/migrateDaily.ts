import { prisma } from "../../src/lib/prisma";

async function migrateDaily() {
  const oldDaily = await prisma.inspection.findMany({
    where: { type: "daily" },
  });

  console.log(`Found ${oldDaily.length} old daily inspections.`);

  for (const old of oldDaily) {
    await prisma.dailyInspection.create({
      data: {
        id: old.id, // reuse the same ID so your URLs still work
        department: old.department,
        inspector: old.inspector,
        createdAt: old.createdAt,
        data: old.data,
      },
    });

    console.log(`Migrated: ${old.id}`);
  }

  console.log("Migration complete.");
}

migrateDaily()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

