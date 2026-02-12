import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_USERS = [
  { email: "erichvandenheuvel5@gmail.com", password: "vandenHeuvel97!", role: "super" as const },
  { email: "demouser1@gmail.com", password: "DemoUser1", role: "super" as const },
];

async function main() {
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
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
