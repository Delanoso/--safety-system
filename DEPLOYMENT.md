# Deployment Guide – Afrihost / Self-Hosted

This app is configured for hosting on **Afrihost** (cPanel, VPS, or shared hosting with Node.js) and other self-hosted environments.

## Prerequisites

1. **PostgreSQL database** – Use Neon, Supabase, Railway, or a DB server.
2. **Cloudinary account** – For uploads (certificates, logos, incident images).
3. **Resend account** (optional) – For emails.

## Environment Variables

Create a `.env` or `.env.local` in the app root (or set in cPanel Node.js App / server):

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Postgres connection string, e.g. `postgresql://user:pass@host:5432/dbname?sslmode=require` |
| `NEXT_PUBLIC_BASE_URL` | ✅ | App URL, e.g. `https://yoursite.co.za` |
| `CLOUDINARY_CLOUD_NAME` | ✅* | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | ✅* | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | ✅* | From Cloudinary dashboard |
| `CLOUDINARY_URL` | ✅* | Alternative: `cloudinary://api_key:api_secret@cloud_name` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Same as `CLOUDINARY_CLOUD_NAME` |
| `RESEND_API_KEY` | | For emails |
| `RESEND_FROM` | | Sender email |
| `OPENAI_API_KEY` | | Optional – AI risk assessments |
| `PORT` | | Port to listen on (default 3000) |

*Use either `CLOUDINARY_URL` or the three separate Cloudinary vars.

---

## Deploy on Afrihost (cPanel Node.js)

1. **Upload or clone** the project to your hosting (e.g. via SSH, Git, or File Manager).

2. **Create a Node.js app** in cPanel:
   - Go to **Setup Node.js App** → **CREATE APPLICATION**
   - Node.js version: **18** or **20**
   - Application root: `/home/username/safety_system_v2` (or your path)
   - Application URL: your domain or subdomain
   - Application startup file: leave default or use `server.js` (see below)

3. **Set environment variables** in the Node.js App dashboard.

4. **Build and run** via SSH:

   ```bash
   cd /home/username/safety_system_v2
   npm install
   npx prisma generate
   npx prisma db push    # or prisma migrate deploy
   npx prisma db seed    # optional – demo data
   npm run build
   npm start
   ```

   Or use **standalone** for a minimal deployment (copy only `.next/standalone` to server):

   ```bash
   npm run build
   cd .next/standalone
   PORT=3000 node server.js
   ```

5. **cPanel startup**  
   For cPanel Node.js app, set Application startup file to `server.js` and Application root to `.next/standalone` after running the build. Or set root to the project folder and run `npm start`.

---

## Deploy on VPS (Ubuntu) with PM2

1. SSH into your server and clone the repo.

2. Install Node.js 20 and PM2:

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   sudo npm install -g pm2
   ```

3. Configure and build:

   ```bash
   cd safety_system_v2
   cp .env.example .env
   # Edit .env with your values
   npm install
   npx prisma generate
   npx prisma db push
   npm run db:seed   # optional
   npm run build
   ```

4. Start with PM2:

   ```bash
   pm2 start npm --name "safety-system" -- start
   pm2 save
   pm2 startup
   ```

   Or with standalone (smaller footprint):

   ```bash
   pm2 start .next/standalone/server.js --name "safety-system" -i 1
   pm2 save
   pm2 startup
   ```

5. Put **Nginx** in front (optional):

   ```nginx
   server {
     listen 80;
     server_name yourdomain.co.za;
     location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

   Add SSL with Certbot: `sudo certbot --nginx -d yourdomain.co.za`

---

## Build Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Prisma generate + Next.js build (no DB access needed) |
| `npm run build:full` | Build + `prisma db push` + `prisma db seed` |
| `npm run start` | Start production server |
| `npm run db:push` | Apply schema to database |
| `npm run db:seed` | Run seed script |
| `npm run db:generate` | Regenerate Prisma client |

---

## First-time Setup

1. Set `DATABASE_URL` and run `npm run db:push` to create tables.
2. Run `npm run db:seed` to create demo users (optional).
3. Default demo login: `demouser1@gmail.com` / `DemoUser1`.
4. For production, remove or restrict bootstrap users in `src/app/api/auth/login/route.ts`.

---

## Cloudinary / Uploads

- Use `CLOUDINARY_URL` = `cloudinary://api_key:api_secret@cloud_name` or the three separate vars.
- Ensure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` matches for client uploads.
- File size: keep uploads under ~4 MB to avoid timeouts.

---

## PDF Generation

The app uses `@sparticuz/chromium` for PDFs. On Linux (VPS), it usually works out of the box. If PDFs fail, check server memory (Chromium needs ~200MB+).
