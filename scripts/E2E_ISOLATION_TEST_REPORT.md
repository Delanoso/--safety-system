# E2E Isolation & Smoke Test Report — safety_system_v2

**Date:** 2026-02-23  
**Scope:** Demo companies, company isolation (Incidents, Users), smoke test of Dashboard / Appointments / Inspections / PPE.

---

## 1) Demo companies created successfully?

**No.** The "Create two demo companies" flow could not be completed.

- **Cause:** `POST /api/auth/create-demo-companies` returns **500** because the database schema is out of date: **the column `User.allowedModules` does not exist** in the current database. The Prisma schema defines it, but migrations have not been applied (or `prisma db push` has not been run with a valid `DATABASE_URL`).
- **Credentials (from code):**  
  - **Demo Company Alpha:** admin@demoalpha.com / DemoAlpha2025!  
  - **Demo Company Beta:** admin@demobeta.com / DemoBeta2025!
- **Fix:** Run `npx prisma db push` (or your usual migration flow) with `DATABASE_URL` set (e.g. in `.env.local`). Then re-run the test script: `node scripts/e2e-isolation-test.mjs`.

---

## 2) Alpha’s incident hidden from Beta (company isolation – Incidents)?

**Could not be tested** because demo companies were not created and login failed.

**Code review:** Company isolation for incidents is implemented correctly:

- **GET /api/incidents:** Uses `getCurrentUser()` and filters with `where.companyId = current.companyId` for non-super users (see `src/app/api/incidents/route.ts`).
- **POST /api/incidents:** Uses `current.companyId` (or explicit `companyId` only for super) when creating incidents.

So once the DB is fixed and the E2E script runs successfully, the expected result is: **yes**, Alpha’s incident will not appear in Beta’s list.

---

## 3) Users list scoped to company?

**Could not be tested** (no successful login as Beta).

**Code review:** User list is company-scoped for admins:

- **GET /api/users:** For `current.role === "admin"`, the handler sets `where.companyId = current.companyId` (see `src/app/api/users/route.ts`). Super users can optionally filter by `companyId` or request all.

So once testable: **yes**, the Users list is scoped to the current user’s company for admins.

---

## 4) Broken pages or errors observed

- **Dashboard (/api/dashboard):** Returns **401** when unauthenticated (expected; route uses `getCurrentUser()`).
- **Appointments (/api/appointments):** Returns **401** when unauthenticated (expected).
- **Inspections list (/api/inspections/list):** Returns **401** when unauthenticated (expected).
- **PPE Dashboard (/api/ppe/dashboard):** Returns **200** when unauthenticated. No runtime error, but see security finding below.

No other broken pages or runtime errors were observed in the tested flows.

---

## 5) Other security / bug findings

1. **PPE Dashboard unauthenticated access**  
   **GET /api/ppe/dashboard** does not call `getCurrentUser()` or any auth check. It returns PPE data (people count, stock, issues, movements) to anyone. PPE models are company-scoped (`companyId`), but this route does **not** filter by company, so it could expose **all companies’ PPE data** to unauthenticated callers.  
   **Recommendation:** Require authentication and scope queries by `current.companyId` (and only allow super to see all if needed).

2. **Database schema out of date**  
   The application expects `User.allowedModules` (and likely `User.inspectionDepartments`). If these columns are missing, create-demo-companies and any route that uses the full User model can fail. Ensure migrations (or `prisma db push`) are run after schema changes.

3. **E2E test script**  
   An automated script was added: `scripts/e2e-isolation-test.mjs`. It uses the API with cookie-based session handling. Run it after fixing the DB and with the dev server on `BASE_URL` (default `http://localhost:3000`):  
   `node scripts/e2e-isolation-test.mjs`

---

## Summary table

| Item | Result |
|------|--------|
| Demo companies created | **No** (DB schema missing `User.allowedModules`) |
| Alpha incident hidden from Beta | **Not tested** (blocked by above) |
| Users list scoped to company | **Not tested** (blocked); code review: **yes** |
| Broken pages | None; 401 on protected routes when logged out is expected |
| Other findings | PPE dashboard lacks auth + company scoping; DB schema drift |
