const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const SOURCE =
  process.argv[2] ||
  "c:/Users/Erich van den Heuvel/Documents/Health and Safety as Files/Health and Safety Audit.xlsx";
const OUT = path.join(__dirname, "../src/data/health-safety-audit-template.json");

function buildAuditRef(subsection, letter, section) {
  const subNum = subsection.match(/^(\d+(?:\.\d+)*)/)?.[1] ?? "";
  if (subNum && letter) return `${subNum}-${letter}`;
  const sectionNum = section.match(/^(\d+(?:\.\d+)*)/)?.[1] ?? "item";
  return letter ? `${sectionNum}-${letter}` : `${sectionNum}-row`;
}

function isMajorSectionRow(col0, col1) {
  if (/^\d+\.\d+\s{2,}[A-Z]/.test(col0)) return true;
  if (
    /^\d+\.\d+\s+[A-Z]/.test(col0) &&
    !/^\d+\.\d+\.\d+/.test(col0) &&
    col1 !== "Weight" &&
    col0.length > 28 &&
    /[A-Z]{3,}/.test(col0)
  ) {
    return true;
  }
  return false;
}

function isSubsectionHeaderRow(col0, col1) {
  if (col1 !== "Weight") return false;
  return /^\d+\.\d+(\.\d+)?\s+\S/.test(col0);
}

function parseAuditRows(rows) {
  let major = "";
  let subsection = "";
  const items = [];

  for (const r of rows) {
    const col0 = String(r[0] || "").trim();
    const col1 = String(r[1] || "").trim();
    if (!col0 || col0 === "TOTAL" || col0 === "Element") continue;

    if (isMajorSectionRow(col0, col1)) {
      major = col0;
      subsection = "";
      continue;
    }

    if (isSubsectionHeaderRow(col0, col1)) {
      subsection = col0;
      if (!major) {
        const sectionNum = col0.match(/^(\d+)\./)?.[1];
        if (sectionNum) major = `Section ${sectionNum}`;
      }
      continue;
    }

    if (!/^[a-z]\)/i.test(col0)) continue;

    const letter = col0.match(/^([a-z])\)/i)?.[1]?.toLowerCase() ?? "";
    const auditRef = buildAuditRef(subsection, letter, major);

    const weight = col1 !== "" && !Number.isNaN(Number(col1)) ? Number(col1) : null;
    const achievedRaw = String(r[2] ?? "").trim();
    const scoreRaw = r[3];
    const score =
      scoreRaw !== "" && scoreRaw != null && !Number.isNaN(Number(scoreRaw))
        ? Number(scoreRaw)
        : null;
    const observations = String(r[4] ?? "").trim();

    let status = "under_review";
    if (achievedRaw !== "") {
      const n = Number(achievedRaw);
      if (!Number.isNaN(n)) {
        if (n >= (weight ?? 3)) status = "compliant";
        else if (n > 0) status = "partial";
        else status = "non_compliant";
      }
    }

    items.push({
      auditRef,
      section: major,
      subsection,
      requirement: col0,
      legislation: mapLegislation(major, subsection, col0),
      appliesTo: "Whole site",
      weight,
      achieved: achievedRaw !== "" ? achievedRaw : null,
      score,
      observations: observations || null,
      status,
    });
  }

  const seenRefs = new Set();
  for (const item of items) {
    let ref = item.auditRef;
    let suffix = 2;
    while (ref && seenRefs.has(ref)) {
      ref = `${item.auditRef}-${suffix++}`;
    }
    item.auditRef = ref;
    seenRefs.add(ref);
  }

  return items;
}

function mapLegislation(section, subsection, question) {
  const hay = `${section} ${subsection} ${question}`.toLowerCase();
  if (hay.includes("coid") || hay.includes("compensation for injuries")) {
    return "Compensation for Occupational Injuries and Diseases Act (COIDA)";
  }
  if (hay.includes("16.2") || hay.includes("section 16")) {
    return "Occupational Health and Safety Act 85 of 1993 (OHSA)";
  }
  if (hay.includes("she rep") || hay.includes("she committee") || hay.includes("committee")) {
    return "Occupational Health and Safety Act 85 of 1993 (OHSA)";
  }
  if (hay.includes("risk assessment") || hay.includes("hazardous substance")) {
    return "General Safety Regulations (GSR)";
  }
  if (hay.includes("lifting machine") || hay.includes("lmi") || hay.includes("gmr")) {
    return "General Machinery Regulations (GMR)";
  }
  if (hay.includes("electrical")) {
    return "Electrical Installation Regulations";
  }
  if (hay.includes("environmental") || hay.includes("pollution") || hay.includes("nema")) {
    return "National Environmental Management Act (NEMA)";
  }
  if (hay.includes("contractor") || hay.includes("37.2")) {
    return "Occupational Health and Safety Act 85 of 1993 (OHSA)";
  }
  if (hay.includes("incident") || hay.includes("investigation")) {
    return "General Administrative Regulations (GAR)";
  }
  if (hay.includes("fire") || hay.includes("emergency")) {
    return "General Safety Regulations (GSR)";
  }
  if (hay.includes("first aid")) {
    return "General Safety Regulations (GSR)";
  }
  if (hay.includes("induction") || hay.includes("training")) {
    return "Occupational Health and Safety Act 85 of 1993 (OHSA)";
  }
  if (subsection.startsWith("2.2")) {
    return "Occupational Health and Safety Act 85 of 1993 (OHSA)";
  }
  return "Salus HSE Audit Checklist";
}

const wb = XLSX.readFile(SOURCE);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
const items = parseAuditRows(rows);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify(
    {
      version: 1,
      source: "Health and Safety Audit.xlsx",
      itemCount: items.length,
      items,
    },
    null,
    2
  )
);

console.log(`Wrote ${items.length} items to ${OUT}`);
const refs = items.map((i) => i.auditRef);
const unique = new Set(refs);
console.log(`Unique auditRefs: ${unique.size} / ${refs.length}`);
