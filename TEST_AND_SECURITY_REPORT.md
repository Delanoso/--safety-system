# Test & Security Report — safety_system_v2

**Date:** February 2025  
**Scope:** Two demo companies, feature testing, company isolation (multi-tenant security).

---

## 1. Demo companies (register page)

Two demo companies are available from the **signup page** (`/signup`):

- **Button:** “Create two demo companies” creates them in one click (idempotent).
- **Credentials:**

| Company               | Admin email           | Password      |
|-----------------------|------------------------|---------------|
| Demo Company Alpha    | admin@demoalpha.com   | DemoAlpha2025! |
| Demo Company Beta     | admin@demobeta.com    | DemoBeta2025! |

You can also run `npm run db:seed` to create the same two companies (and super users) via Prisma seed.

**Code:** `src/app/api/auth/create-demo-companies/route.ts`, signup form in `src/app/signup/page.tsx`, and `prisma/seed.ts`.

---

## 2. Company isolation (can companies see each other’s data?)

### ✅ Isolated by company (secure)

- **Incidents** — List and create use `companyId`; admins only see their company’s incidents.
- **Users** — List filtered by `companyId` for admins; admins cannot see or edit users of other companies.
- **NCR reports** — Have `companyId`; APIs scope by current user’s company.
- **Risk assessments, hazardous chemicals, contractors** — All use `companyId` and are scoped in APIs.
- **SHE Committee (meetings, elections)** — Use `companyId` and are scoped.
- **Maintenance schedules** — Use `companyId` and are scoped.
- **Company logo/settings** — Admin can only update their own company (`current.companyId`).
- **Dashboard** — Incident stats and other data are filtered by `companyId` where applicable.

### ✅ Now tenant-scoped (fixed)

- **Appointments** — `companyId` added to `Appointment`; list/create/get/patch/delete filter or set by `current.companyId`. Super users see all; company users only their company's appointments.
- **Inspections (daily, weekly, monthly)** — `companyId` added; list/save/delete scoped by company. Inspections are shared; filtering is by “department” (and user’s `inspectionDepartments`), not by company. If two companies use the same department name, they could see each other’s inspections. For full tenant isolation, add `companyId` to these models and filter by it.

### PPE (fixed)

- **PPE** — `companyId` added to `PPEDepartment` and `PPEItemType`; dashboard, departments, item-types, stock, persons scoped by company.

---

## 3. Fixes applied in this pass

1. **Create demo companies** — API and signup UI added; creation works even when the DB is missing `User.allowedModules` / `User.inspectionDepartments` (raw INSERT fallback).
2. **Seed** — Two demo companies (Alpha, Beta) are created by `prisma/seed.ts`.
3. **Appointments** — `companyId` added to schema; auth and company scoping on all routes.
4. **Inspections** — `companyId` added to daily/weekly/monthly models; list/save/delete scoped by company.
5. **PPE** — `companyId` added to `PPEDepartment` and `PPEItemType`; dashboard, departments, item-types, stock, persons scoped by company; auth and company checks on all relevant routes.
6. **Login/getCurrentUser** — Raw-query fallback for missing User columns (from earlier work).

---

## 4. How to test manually

1. **Create demo companies**  
   Go to `/signup` → click “Create two demo companies”. Confirm success and note the credentials above.

2. **Incident isolation**  
   - Log in as **admin@demoalpha.com** / **DemoAlpha2025!** → Incidents → create “Alpha Incident”.  
   - Log out (e.g. Dashboard → Profile → Log out).  
   - Log in as **admin@demobeta.com** / **DemoBeta2025!** → Incidents.  
   - **Expected:** “Alpha Incident” does **not** appear.

3. **Users isolation**  
   - As Beta admin, open **Users**.  
   - **Expected:** Only Beta’s users (e.g. just the Beta admin); no Alpha users.

4. **Smoke test**  
   As either admin, open: Dashboard, Appointments, Inspections (select department → ongoing), PPE Management, Risk Assessments, Hazardous Chemicals, Users. Confirm pages load and no console/API errors.

---

## 5. Summary table

| Area              | Isolated by company? | Notes                                      |
|-------------------|----------------------|--------------------------------------------|
| Incidents         | Yes                  | Filtered by `companyId`                    |
| Users             | Yes                  | Admins see only their company               |
| NCR, Risk, SHE, etc. | Yes               | All use `companyId` and API filters        |
| Appointments      | Yes                  | `companyId` added; list/create/CRUD scoped  |
| Inspections       | Yes                  | `companyId` on daily/weekly/monthly; list/save/delete scoped |
| PPE               | Yes                  | `companyId` on PPEDepartment & PPEItemType; dashboard, stock, persons, departments scoped |

**Migration:** Run `npx prisma migrate deploy` (or `npm run db:migrate`) so the new columns exist. Existing rows keep `companyId` null and remain visible only to super users where applicable.
