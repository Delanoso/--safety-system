# Docker

## How Dockerizing Works

1. **Dockerfile** defines a **multi-stage build**:
   - **deps:** Install `node_modules` with `npm ci` (reproducible, no dev server).
   - **builder:** Copy deps, run `prisma generate` and `next build`. Next.js is configured with `output: "standalone"`, so it produces a minimal, self-contained server in `.next/standalone`.
   - **runner:** Start from a clean Node image, copy only the standalone app, Prisma client, and schema. No source or dev dependencies. The container runs `node server.js` (the Next.js production server).

2. **.dockerignore** keeps the image small and secure: `node_modules`, `.next`, `.env`, and other unneeded files are excluded from the build context.

3. **docker-compose.yml** is for **local** use: it starts Postgres and the app. The app container gets `DATABASE_URL` pointing at the `db` service. On start, it runs `prisma migrate deploy` then `node server.js`.

## Build and run (image only)

```bash
# Build the image
docker build -t safety-system .

# Run (you must pass DATABASE_URL or use env file)
docker run -p 3000:3000 --env-file .env safety-system
```

## Run with Docker Compose (app + Postgres)

1. Copy env and set database URL for the container network:
   ```bash
   cp .env.example .env
   # In .env set:
   # DATABASE_URL=postgresql://safety:safety@db:5432/safety
   ```
2. Start:
   ```bash
   docker compose up --build
   ```
3. Open http://localhost:3000. Migrations run on first start.

To run in the background: `docker compose up -d --build`.

## Production

- Use your own Postgres (e.g. RDS, Cloud SQL) or run Postgres as a separate container. Set `DATABASE_URL` in the app container.
- Do **not** rely on the compose `command` for migrations in production; run `prisma migrate deploy` in your CI/CD or a one-off job, then start the app with `CMD ["node", "server.js"]` (default in the Dockerfile).
- Pass all required env vars (see PRODUCTION.md): `DATABASE_URL`, `NEXT_PUBLIC_BASE_URL`, Cloudinary, Resend, optional Sentry, etc.
