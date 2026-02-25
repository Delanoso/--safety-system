/**
 * Reset database: remove all companies and data, keep only demouser1
 * and one company (Demo Company). Run with: npx tsx prisma/reset-db-single-company.ts
 *
 * Loads .env / .env.local from project root so DATABASE_URL is set.
 */
const path = require("path");
const fs = require("fs");
const root = path.join(__dirname, "..");

function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      value = value.slice(1, -1);
    process.env[key] = value;
  }
}

loadEnv(path.join(root, ".env"));
loadEnv(path.join(root, ".env.local"));

const { PrismaClient } = require("../node_modules/prisma-client-generated");
const prisma = new PrismaClient();

const DEMO_EMAIL = "demouser1@gmail.com";
const DEMO_PASSWORD = "DemoUser1";

async function main() {
  console.log("Resetting database: clearing all data and keeping only demouser1 + one company...");

  // Delete in dependency order (children before parents)
  await prisma.investigationTeamMember.deleteMany({});
  await prisma.signatureToken.deleteMany({});
  await prisma.incidentImage.deleteMany({});
  await prisma.costAnalysis.deleteMany({});
  await prisma.incidentDocument.deleteMany({});
  await prisma.incident.deleteMany({});

  await prisma.ncrImage.deleteMany({});
  await prisma.ncrItem.deleteMany({});
  await prisma.ncrReport.deleteMany({});

  await prisma.appointment.deleteMany({});

  await prisma.dailyInspection.deleteMany({});
  await prisma.weeklyInspection.deleteMany({});
  await prisma.monthlyInspection.deleteMany({});

  await prisma.certificate.deleteMany({});
  await prisma.medical.deleteMany({});

  await prisma.pPEIssue.deleteMany({});
  await prisma.pPESizeReminderToken.deleteMany({});
  await prisma.pPEStockMovement.deleteMany({});
  await prisma.pPEStock.deleteMany({});
  await prisma.pPESubDepartmentItem.deleteMany({});
  await prisma.pPEPerson.deleteMany({});
  await prisma.pPESubDepartment.deleteMany({});
  await prisma.pPEDepartment.deleteMany({});
  await prisma.pPEItemType.deleteMany({});

  await prisma.sHEElectionVoter.deleteMany({});
  await prisma.sHEElectionCandidate.deleteMany({});
  await prisma.sHEElection.deleteMany({});
  await prisma.sHECommitteeMeeting.deleteMany({});

  await prisma.riskAssessment.deleteMany({});
  await prisma.hazardousChemical.deleteMany({});

  await prisma.contractorDocument.deleteMany({});
  await prisma.contractor.deleteMany({});

  await prisma.maintenanceService.deleteMany({});
  await prisma.maintenanceItem.deleteMany({});
  await prisma.maintenanceSchedule.deleteMany({});

  await prisma.file.deleteMany({});
  await prisma.folder.deleteMany({});

  // Delete all users except demouser1
  const deletedUsers = await prisma.user.deleteMany({
    where: { email: { not: DEMO_EMAIL } },
  });
  console.log(`Deleted ${deletedUsers.count} user(s) (kept ${DEMO_EMAIL}).`);

  // Delete all companies
  const deletedCompanies = await prisma.company.deleteMany({});
  console.log(`Deleted ${deletedCompanies.count} companies.`);

  // Create one company
  const company = await prisma.company.create({
    data: { name: "Demo Company", userLimit: 10 },
  });
  console.log(`Created company: ${company.name} (${company.id}).`);

  // Ensure demouser1 exists and is linked to the company
  const bcrypt = require("bcryptjs");
  let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (!user) {
    const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);
    user = await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        password: hashed,
        role: "admin",
        companyId: company.id,
      },
    });
    console.log(`Created user: ${DEMO_EMAIL} (admin of Demo Company).`);
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { companyId: company.id, role: "admin" },
    });
    console.log(`Updated ${DEMO_EMAIL} → companyId=${company.id}, role=admin.`);
  }

  console.log("Done. Log in with:", DEMO_EMAIL, "/", DEMO_PASSWORD);
}

main()
  .catch((e) => {
    console.error("Reset failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
