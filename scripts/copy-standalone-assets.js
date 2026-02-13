#!/usr/bin/env node
/**
 * Copies public/ and .next/static to .next/standalone for self-hosted deployment.
 * Run automatically after `next build` when output: "standalone" is set.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const standaloneDir = path.join(root, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  console.log("postbuild: .next/standalone not found (skipping asset copy)");
  process.exit(0);
}

function cpDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) cpDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const publicSrc = path.join(root, "public");
const publicDest = path.join(standaloneDir, "public");
const staticSrc = path.join(root, ".next", "static");
const staticDest = path.join(standaloneDir, ".next", "static");

if (fs.existsSync(publicSrc)) {
  cpDir(publicSrc, publicDest);
  console.log("postbuild: copied public/ to standalone");
}
if (fs.existsSync(staticSrc)) {
  cpDir(staticSrc, staticDest);
  console.log("postbuild: copied .next/static to standalone");
}
