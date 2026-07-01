#!/usr/bin/env node
/**
 * Smoke test: hits /api/health and optionally the login page.
 * Run with: node scripts/smoke-test.mjs [BASE_URL]
 * Default BASE_URL: http://localhost:3000
 * Exit 0 if all pass, 1 otherwise.
 */

const BASE = process.argv[2] || "http://localhost:3000";

async function main() {
  let failed = 0;

  // 1. Health check
  try {
    const res = await fetch(`${BASE}/api/health`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok !== true || data.database !== "connected") {
      console.error("FAIL /api/health:", res.status, data);
      failed++;
    } else {
      console.log("OK  /api/health");
    }
  } catch (err) {
    console.error("FAIL /api/health:", err.message);
    failed++;
  }

  // 2. Login page (GET / returns 200 and has login form)
  try {
    const res = await fetch(`${BASE}/`, { redirect: "manual" });
    const html = await res.text();
    const hasLogin = html.includes("password") || html.includes("login") || html.includes("Email");
    if (!res.ok && res.status !== 302) {
      console.error("FAIL GET /:", res.status);
      failed++;
    } else if (!hasLogin && res.status === 200) {
      console.error("FAIL GET /: page may not be login (no password/login/Email found)");
      failed++;
    } else {
      console.log("OK  GET / (login page)");
    }
  } catch (err) {
    console.error("FAIL GET /:", err.message);
    failed++;
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();
