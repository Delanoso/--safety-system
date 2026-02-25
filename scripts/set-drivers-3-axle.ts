/**
 * Create department "Drivers", sub-department "3 Axle drivers", and assign all existing
 * PPE persons to it (department, subDepartment, subDepartmentId). Keeps contact details.
 * Run from project root: npx tsx scripts/set-drivers-3-axle.ts
 */
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const prisma = new PrismaClient();

async function main() {
  let dept = await prisma.pPEDepartment.findFirst({ where: { name: "Drivers" } });
  if (!dept) {
    dept = await prisma.pPEDepartment.create({ data: { name: "Drivers" } });
    console.log("Created department: Drivers");
  }
  let sub = await prisma.pPESubDepartment.findFirst({
    where: { departmentId: dept.id, name: "3 Axle drivers" },
  });
  if (!sub) {
    sub = await prisma.pPESubDepartment.create({
      data: { departmentId: dept.id, name: "3 Axle drivers" },
    });
    console.log("Created sub-department: 3 Axle drivers");
  }

  const result = await prisma.pPEPerson.updateMany({
    where: {},
    data: {
      department: "Drivers",
      subDepartment: "3 Axle drivers",
      subDepartmentId: sub.id,
    },
  });
  console.log("Updated", result.count, "people to department Drivers, sub-department 3 Axle drivers.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
