# Deployment Guide – Vercel

## Prerequisites

1. **PostgreSQL database** – Required for Vercel.
2. **Cloudinary account** – For uploads (certificates, logos, incident images).
3. **Resend account** – For emails (optional but recommended for appointments, votes).

## Environment Variables (Vercel)

Add these in **Project → Settings → Environment Variables**. For each variable, enable **Production**, **Preview** (all branches), and **Development**.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Postgres connection string. For **Neon**: use the *pooled* URL (host contains `-pooler`), e.g. `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require` |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Your app URL, e.g. `https://your-app.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | ✅ | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | ✅ | From Cloudinary dashboard |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Same as CLOUDINARY_CLOUD_NAME |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | | Upload preset for client uploads |
| `RESEND_API_KEY` | | For emails (appointments, PPE, votes) |
| `RESEND_FROM` | | Sender email, e.g. `noreply@yourdomain.com` |
| `OPENAI_API_KEY` | | Optional – AI risk assessments |

## Local Development

You need a PostgreSQL database. Options:

1. **Neon** (free) – [neon.tech](https://neon.tech), create a project, copy the connection string.
2. **Supabase** (free) – [supabase.com](https://supabase.com), create a project, use the Postgres URL.
3. **Docker** – `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`

```bash
cp .env.example .env.local
# Set DATABASE_URL and other vars in .env.local
npm run dev
```

For **SQLite** (local only), change `prisma/schema.prisma` to `provider = "sqlite"` and `url = "file:./dev.db"`, then use `npm run dev` (skip `prisma db push` in build for local).

## Deploy to Vercel

1. Connect your repo to Vercel.
2. Add all required environment variables in **Project → Settings → Environment Variables**.
3. **Environment scope:** For each variable, enable:
   - **Production**
   - **Preview** (covers all branch deployments)
   - **Development** (for `vercel dev` locally)
4. Build command: `npm run build` (runs `prisma generate`, `prisma db push`, `prisma db seed`, then `next build`).
5. Deploy.

### "Unable to open the database file" (500 on login)

This error means Prisma is using SQLite instead of PostgreSQL. Fix it:

1. **Set `DATABASE_URL` on Vercel** – Project → Settings → Environment Variables → add:
   - `DATABASE_URL` = your PostgreSQL connection string (e.g. from [Neon](https://neon.tech) or [Supabase](https://supabase.com))
   - Format: `postgresql://user:password@host:5432/dbname?sslmode=require`
2. **Enable for Production, Preview, and Development** – Check all three so every deployment can connect.
3. **Redeploy** – In Deployments → ⋮ → Redeploy, optionally with "Clear build cache".

### If login fails on Vercel

1. **Check database:** Open `https://your-app.vercel.app/api/health` – it should show `userCount`. If `userCount: 0`, no users exist.
2. **Create demo users:** Open `https://your-app.vercel.app/api/seed` in your browser – this creates the demo users if none exist.
3. **Try login again** with `demouser1@gmail.com` / `DemoUser1`.

## Super Users (Bootstrap)

On first login with these emails, accounts are created if they don't exist:

- `erichvandenheuvel5@gmail.com` / `vandenHeuvel97!`
- `demouser1@gmail.com` / `DemoUser1`

For production, restrict or remove this in `src/app/api/auth/login/route.ts`.
