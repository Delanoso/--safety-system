"use strict";
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
function loadEnv(filePath) {
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

execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: root, env: process.env });
