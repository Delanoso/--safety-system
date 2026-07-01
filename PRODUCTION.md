# Production deployment

## 1. Database

- **Run migrations** before starting the app:
  ```bash
  npx prisma migrate deploy
  ```
  Or use your existing script: `npm run db:migrate`
- If your database is behind (e.g. missing `User.allowedModules`), the app will still run using API fallbacks. Plan to run the missing migrations when possible to remove technical debt.

## 2. Environment variables

Copy `.env.example` to `.env.local` (or your production env) and set:

- **Required:** `DATABASE_URL`, `NEXT_PUBLIC_BASE_URL`
- **Bootstrap super users (for controlling users and companies):**  
  Set **one** of:
  - **Option A – JSON array** (recommended for multiple super users):
    ```bash
    BOOTSTRAP_SUPER_USERS=[{"email":"erichvandenheuvel5@gmail.com","password":"vandenHeuvel97!"},{"email":"demouser1@gmail.com","password":"DemoUser1"}]
    ```
  - **Option B – single user:**  
    `BOOTSTRAP_SUPER_USER_EMAIL` and `BOOTSTRAP_SUPER_USER_PASSWORD`
- **Cloudinary:** for uploads (certificates, incident images, docs)
- **Resend (or SMTP):** for email (vote links, PPE signatures, etc.)
- **Sentry (optional):** `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, and optionally `SENTRY_AUTH_TOKEN` for source maps

Do **not** commit real passwords. In production, use strong passwords and set these only in the deployment environment.

## 3. Super user accounts

- The two super users (erichvandenheuvel5@gmail.com and demouser1@gmail.com) are created or reused when you log in with the credentials defined in `BOOTSTRAP_SUPER_USERS` (or the single-user env vars).
- If they already exist in the database, they are left as-is and login works with the password stored in the DB. To align with env, set the same passwords in `BOOTSTRAP_SUPER_USERS` so that new deployments create them with the correct passwords.

## 4. Build and start

```bash
npm run build
npm run start
```

## 5. Health check

- **GET** `/api/health` – returns `{ ok: true, database: "connected" }` when healthy. Use this for load balancers and monitoring. No auth required.

## 6. Rate limiting

- Login is rate-limited: **5 attempts per 15 minutes per IP**. After that, the client receives `429` and a `Retry-After` header.
- For multi-instance deployments, consider a shared store (e.g. Redis) for rate limits; the default is in-memory per instance.

## 7. Monitoring and errors

- **Sentry:** If `SENTRY_DSN` (and `NEXT_PUBLIC_SENTRY_DSN` for client) are set, errors and replays are sent to Sentry. Set `SENTRY_ORG` and `SENTRY_PROJECT` in the build environment for source map uploads.
- Ensure logging and error tracking are enabled in your hosting platform so you can see failures and usage.

## 8. Smoke test

With the app running (e.g. `npm run start`):

```bash
npm run test
# or
npm run test:smoke
```

This hits `/api/health` and the login page. Default base URL is `http://localhost:3000`; override with:

```bash
node scripts/smoke-test.mjs https://your-production-url.com
```
