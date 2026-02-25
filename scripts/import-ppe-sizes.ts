/**
 * One-off import: read ppe-sizes (1).xlsx from Downloads and add people to PPE Size List.
 * Run from project root: npx tsx scripts/import-ppe-sizes.ts
 * Requires DATABASE_URL in .env.local (loaded automatically from project root).
 */
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import path from "path";
import os from "os";
import fs from "fs";

// Load .env.local from project root so DATABASE_URL is set
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

const excelPath =
  path.join(os.homedir(), "Downloads", "ppe-sizes (1).xlsx");

function main() {
  const wb = XLSX.readFile(excelPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (!rows.length || !Array.isArray(rows[0])) {
    console.error("No rows or invalid sheet");
    process.exit(1);
  }
  const headers = (rows[0] as unknown[]).map((h) => String(h ?? "").trim().toUpperCase());
  const nameIdx = headers.findIndex((h) => h === "NAME");
  const surnameIdx = headers.findIndex((h) => h === "SURNAME");
  const contactIdx = headers.findIndex((h) => h === "CONTACT NUMBER" || h.includes("CONTACT"));
  const overallPantsIdx = headers.findIndex((h) => h.includes("OVERALL") && h.includes("PANTS"));
  const safetyBootIdx = headers.findIndex((h) => h.includes("SAFETYBOOT") || h.includes("SAFETY BOOT"));
  const reflectorIdx = headers.findIndex((h) => h.includes("REFLECTOR") || h.includes("VEST"));
  const shirtIdx = headers.findIndex((h) => h.includes("SHIRT"));

  if (nameIdx < 0 || surnameIdx < 0) {
    console.error("Need NAME and SURNAME columns");
    process.exit(1);
  }

  const dataRows = rows.slice(1) as unknown[][];
  let created = 0;
  let skipped = 0;

  async function run() {
    for (let r = 0; r < dataRows.length; r++) {
      const row = dataRows[r];
      if (!Array.isArray(row)) continue;
      const firstName = String(row[nameIdx] ?? "").trim();
      const surname = String(row[surnameIdx] ?? "").trim();
      const fullName = [firstName, surname].filter(Boolean).join(" ").trim();
      if (!fullName) {
        skipped++;
        continue;
      }
      let phone: string | null =
        contactIdx >= 0 && row[contactIdx] != null
          ? String(row[contactIdx]).trim() || null
          : null;
      if (phone === "Not provided" || phone === "N/A") phone = null;

      const sizes: Record<string, string> = {};
      if (overallPantsIdx >= 0 && row[overallPantsIdx] != null && String(row[overallPantsIdx]).trim()) {
        sizes["Conti Suit Pants"] = String(row[overallPantsIdx]).trim();
      }
      if (safetyBootIdx >= 0 && row[safetyBootIdx] != null && String(row[safetyBootIdx]).trim()) {
        sizes["Safety Shoes"] = String(row[safetyBootIdx]).trim();
      }
      if (reflectorIdx >= 0 && row[reflectorIdx] != null && String(row[reflectorIdx]).trim()) {
        sizes["Reflector Vest"] = String(row[reflectorIdx]).trim();
      }
      if (shirtIdx >= 0 && row[shirtIdx] != null && String(row[shirtIdx]).trim()) {
        sizes["T-Shirt"] = String(row[shirtIdx]).trim();
      }

      try {
        await prisma.pPEPerson.create({
          data: {
            name: fullName,
            phone: phone === "Not provided" || phone === "N/A" ? null : phone,
            email: null,
            department: null,
            subDepartment: null,
            sizes: Object.keys(sizes).length > 0 ? JSON.stringify(sizes) : null,
          },
        });
        created++;
        if (created % 50 === 0) console.log(`Created ${created}...`);
      } catch (e: unknown) {
        if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") {
          skipped++;
          // unique constraint (e.g. duplicate name) - skip
        } else {
          console.error("Error at row", r + 2, fullName, e);
        }
      }
    }
    console.log(`Done. Created: ${created}, Skipped: ${skipped}`);
  }

  run()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      prisma.$disconnect();
      process.exit(1);
    });
}

main();
