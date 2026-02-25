/**
 * Run once to get the short path for your browser, then add to .env.local:
 *   PUPPETEER_EXECUTABLE_PATH=<output of this script>
 *
 * Usage: node scripts/get-browser-path.js
 * Or:    node scripts/get-browser-path.js "C:\path\to\brave.exe"
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const argPath = process.argv.slice(2).join(" ").trim() || null;
const longPath = argPath || [
  path.join(process.env.LOCALAPPDATA || "", "BraveSoftware", "Brave Browser", "Application", "brave.exe"),
  path.join(process.env.LOCALAPPDATA || "", "BraveSoftware", "Brave-Browser", "Application", "brave.exe"),
  path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
  path.join(process.env.LOCALAPPDATA || "", "Microsoft", "Edge", "Application", "msedge.exe"),
  path.join(process.env.PROGRAMFILES || "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
  path.join(process.env.PROGRAMFILES || "C:\\Program Files", "Microsoft", "Edge", "Application", "msedge.exe"),
].find((p) => p && fs.existsSync(p));

if (!longPath) {
  console.error("No browser found. Pass the full path: node scripts/get-browser-path.js \"C:\\path\\to\\brave.exe\"");
  process.exit(1);
}
if (!argPath && !fs.existsSync(longPath)) {
  console.error("Path not found:", longPath);
  process.exit(1);
}

try {
  const b64 = Buffer.from(longPath, "utf16le").toString("base64");
  const script = `$p=[System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String('${b64}'));(New-Object -ComObject Scripting.FileSystemObject).GetFile($p).ShortPath`;
  const shortPath = execSync(
    `powershell -NoProfile -EncodedCommand ${Buffer.from(script, "utf16le").toString("base64")}`,
    { encoding: "utf8" }
  ).trim();
  if (shortPath && fs.existsSync(shortPath)) {
    console.log("Add this line to .env.local (no quotes):");
    console.log("");
    console.log("PUPPETEER_EXECUTABLE_PATH=" + shortPath);
    console.log("");
    return;
  }
} catch (e) {
  // fallback: print long path and tell user to try it
}
console.log("Short path failed. Try adding this to .env.local (use quotes if path has spaces):");
console.log("");
console.log('PUPPETEER_EXECUTABLE_PATH="' + longPath + '"');
console.log("");
console.log("Then restart the dev server.");
