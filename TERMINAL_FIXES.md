# Fixing Terminal / Dev Server Problems

## 1. Turbopack cache errors ("Persisting failed", "corrupted database", ENOENT .sst files)

**Cause:** The `.next/dev` cache (Turbopack) can get corrupted or locked when more than one dev server runs, or when the process is killed while writing.

**Fix:**
1. **Stop all dev servers** – Close every terminal where `npm run dev` or `next dev` is running (Ctrl+C), and make sure no other Node process is using the project.
2. **Clear the cache and restart:**
   ```bash
   npm run clean
   npm run dev
   ```
   Or in one go: `npm run dev:fresh` (cleans `.next`, runs `prisma generate`, then `next dev`). Still stop any other dev server first.

## 2. "User.allowedModules does not exist" / Prisma column errors

**Cause:** The database is behind the Prisma schema (migrations not applied).

**Fix:** Apply migrations:
```bash
npx prisma migrate deploy
```
Or sync schema without migration history: `npm run db:push` (dev only).

## 3. "Port 3000 is in use" / "Unable to acquire lock at .next/dev/lock"

**Cause:** Another `next dev` (or another app) is already running.

**Fix:**
- Stop the other process using the port, or
- Use a different port: `next dev -p 3001`
- Only run **one** `npm run dev` at a time for this project.

## 4. "Unknown argument companyId" on appointment create

**Cause:** The running dev server was using an old Prisma client or cached build.

**Fix:** Use a clean dev run so the correct client and cache are used:
1. Stop the dev server.
2. Run: `npm run dev:fresh`
3. Try creating an appointment again.

## Quick checklist when things break

1. Stop all `npm run dev` terminals.
2. `npm run clean` then `npm run dev`, **or** `npm run dev:fresh`.
3. If auth or DB errors appear: `npx prisma migrate deploy`.
4. Only one dev server should be running.
