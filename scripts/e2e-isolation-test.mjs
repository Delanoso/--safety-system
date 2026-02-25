/**
 * E2E test: demo companies, company isolation (incidents, users), smoke pages.
 * Run with: node scripts/e2e-isolation-test.mjs
 * Requires dev server on BASE_URL (default http://localhost:3000).
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function parseSetCookie(headerOrArray) {
  const out = {};
  const list = headerOrArray == null ? [] : Array.isArray(headerOrArray) ? headerOrArray : [headerOrArray];
  for (const raw of list) {
    const part = String(raw).split(";")[0].trim();
    const eq = part.indexOf("=");
    if (eq > 0) out[part.slice(0, eq)] = part.slice(eq + 1);
  }
  return out;
}

function getAllSetCookie(res) {
  if (typeof res.headers.getSetCookie === "function") return res.headers.getSetCookie();
  const raw = res.headers.raw && res.headers.raw();
  if (raw && raw["set-cookie"]) return raw["set-cookie"];
  const one = res.headers.get("set-cookie");
  return one ? [one] : [];
}

function cookieHeader(cookies) {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

let sessionCookies = {};

async function fetchWithCookies(url, options = {}) {
  const headers = { ...options.headers };
  const cookieStr = cookieHeader(sessionCookies);
  if (cookieStr) headers["Cookie"] = cookieStr;
  const res = await fetch(url, { ...options, headers });
  const setCookieList = getAllSetCookie(res);
  if (setCookieList.length) {
    sessionCookies = { ...sessionCookies, ...parseSetCookie(setCookieList) };
  }
  return res;
}

async function main() {
  const report = {
    demoCompaniesCreated: false,
    demoCredentials: null,
    alphaIncidentHiddenFromBeta: null,
    usersScopedToCompany: null,
    brokenPages: [],
    errors: [],
    otherFindings: [],
  };

  console.log("=== 1) Create two demo companies ===\n");
  try {
    const createRes = await fetchWithCookies(`${BASE_URL}/api/auth/create-demo-companies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const createData = await createRes.json().catch(() => ({}));
    if (!createRes.ok) {
      const errMsg = createData?.error || createRes.status;
      report.errors.push(`Create demo companies failed: ${errMsg}`);
      console.log("FAIL:", createRes.status, createData);
      if (createRes.status === 500 && createData?.detail) {
        console.log("Detail:", createData.detail);
      }
    } else {
      report.demoCompaniesCreated = true;
      report.demoCredentials = createData?.companies || [
        { companyName: "Demo Company Alpha", email: "admin@demoalpha.com", password: "DemoAlpha2025!" },
        { companyName: "Demo Company Beta", email: "admin@demobeta.com", password: "DemoBeta2025!" },
      ];
      console.log("Success:", createData?.message);
      console.log("Credentials:", JSON.stringify(report.demoCredentials, null, 2));
    }
  } catch (e) {
    report.errors.push(`Create demo companies error: ${e.message}`);
    console.log("Error:", e.message);
  }

  console.log("\n=== 2) Test company isolation - Incidents ===\n");

  // Login Alpha
  const loginAlpha = await fetchWithCookies(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@demoalpha.com", password: "DemoAlpha2025!" }),
  });
  if (!loginAlpha.ok) {
    report.errors.push("Login as Alpha failed");
    console.log("Login Alpha FAIL");
  } else {
    console.log("Logged in as Alpha.");
    const getIncidentsAlpha1 = await fetchWithCookies(`${BASE_URL}/api/incidents`);
    const incidentsAlpha1 = (await getIncidentsAlpha1.json().catch(() => ({}))).incidents || [];
    const alphaIncident = {
      title: "Alpha Incident",
      type: "Near Miss",
      description: "E2E test incident",
      status: "Open",
      severity: "Low",
      date: new Date().toISOString(),
    };
    const createIncidentRes = await fetchWithCookies(`${BASE_URL}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alphaIncident),
    });
    if (!createIncidentRes.ok) {
      report.errors.push("Create Alpha incident failed: " + (await createIncidentRes.text()));
    } else {
      console.log("Created incident 'Alpha Incident'.");
    }
    const getIncidentsAlpha2 = await fetchWithCookies(`${BASE_URL}/api/incidents`);
    const incidentsAlpha2 = (await getIncidentsAlpha2.json().catch(() => ({}))).incidents || [];
    const hasAlphaIncident = (incidentsAlpha2 || []).some((i) => i.title === "Alpha Incident");
    if (!hasAlphaIncident) report.errors.push("Alpha incident not found in list after create");
    else console.log("Alpha incident appears in list.");
  }

  // Logout
  await fetchWithCookies(`${BASE_URL}/api/auth/logout`, { method: "POST" });
  sessionCookies = {};
  console.log("Logged out.");

  // Login Beta
  const loginBeta = await fetchWithCookies(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@demobeta.com", password: "DemoBeta2025!" }),
  });
  if (!loginBeta.ok) {
    report.errors.push("Login as Beta failed");
    console.log("Login Beta FAIL");
  } else {
    console.log("Logged in as Beta.");
    const getIncidentsBeta = await fetchWithCookies(`${BASE_URL}/api/incidents`);
    const dataBeta = await getIncidentsBeta.json().catch(() => ({}));
    const incidentsBeta = dataBeta.incidents || [];
    const alphaVisibleToBeta = incidentsBeta.some((i) => i.title === "Alpha Incident");
    report.alphaIncidentHiddenFromBeta = !alphaVisibleToBeta;
    if (alphaVisibleToBeta) {
      report.errors.push("SECURITY: Alpha Incident visible to Beta company");
      console.log("FAIL: Alpha Incident is visible to Beta (company isolation broken).");
    } else {
      console.log("PASS: Alpha Incident is NOT in Beta's list (company isolation OK).");
    }
  }

  console.log("\n=== 3) Test company isolation - Users ===\n");
  const getUsersRes = await fetchWithCookies(`${BASE_URL}/api/users`);
  if (!getUsersRes.ok) {
    report.errors.push("GET /api/users failed: " + getUsersRes.status);
    report.usersScopedToCompany = false;
  } else {
    const users = await getUsersRes.json().catch(() => []);
    const list = Array.isArray(users) ? users : [];
    const allBeta = list.every((u) => u.companyName === "Demo Company Beta" || u.email === "admin@demobeta.com");
    const hasAlphaUser = list.some((u) => u.email === "admin@demoalpha.com" || u.companyName === "Demo Company Alpha");
    report.usersScopedToCompany = allBeta && !hasAlphaUser;
    if (hasAlphaUser) {
      report.errors.push("SECURITY: Alpha user visible in Beta's user list");
      console.log("FAIL: Alpha users visible to Beta.");
    } else {
      console.log("PASS: Users list scoped to company (only Beta or current admin).");
    }
  }

  console.log("\n=== 4) Smoke test - Dashboard, Appointments, Inspections, PPE ===\n");
  const smokeUrls = [
    ["/api/dashboard", "Dashboard"],
    ["/api/appointments", "Appointments"],
    ["/api/inspections/list", "Inspections list"],
    ["/api/ppe/dashboard", "PPE Dashboard"],
  ];
  for (const [path, name] of smokeUrls) {
    try {
      const r = await fetchWithCookies(`${BASE_URL}${path}`);
      if (!r.ok) {
        report.brokenPages.push(`${name} (${path}): ${r.status}`);
        console.log(name, r.status);
      } else {
        console.log(name, "OK");
      }
    } catch (e) {
      report.brokenPages.push(`${name}: ${e.message}`);
      report.errors.push(`${name} error: ${e.message}`);
      console.log(name, "Error:", e.message);
    }
  }

  console.log("\n=== Report ===\n");
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.errors.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
