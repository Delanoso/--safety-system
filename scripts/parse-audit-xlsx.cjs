const XLSX = require("xlsx");
const path =
  "c:/Users/Erich van den Heuvel/Documents/Health and Safety as Files/Health and Safety Audit.xlsx";

const rows = XLSX.utils.sheet_to_json(XLSX.readFile(path).Sheets.Sheet1, {
  header: 1,
  defval: "",
});

let major = "";
const subsections = [];
const questions = [];

for (const r of rows) {
  const col0 = String(r[0] || "").trim();
  const col1 = String(r[1] || "").trim();
  if (!col0) continue;

  if (/^\d+\.\d+\s+[A-Z]/.test(col0) && !/^\d+\.\d+\.\d+/.test(col0)) {
    major = col0;
    continue;
  }

  if (/^\d+\.\d+\.\d+\s+/.test(col0) && col1 === "Weight") {
    subsections.push({ major, subsection: col0 });
    continue;
  }

  if (/^[a-z]\)/i.test(col0)) {
    questions.push({
      major,
      subsection: subsections[subsections.length - 1]?.subsection ?? "",
      question: col0,
      weight: r[1],
    });
  }
}

console.log("Major sections:");
[...new Set(questions.map((q) => q.major))].forEach((m) => console.log(" -", m));
console.log("\nSubsections:", subsections.length);
subsections.forEach((s) => console.log(" -", s.subsection));
console.log("\nTotal audit questions:", questions.length);
console.log("\nSample questions:");
questions.slice(0, 5).forEach((q) => console.log(JSON.stringify(q)));
questions.slice(-3).forEach((q) => console.log(JSON.stringify(q)));
