# External services and APIs – Afrihost setup

Use this list to create or update accounts and set environment variables before hosting on Afrihost.

---

## 1. PostgreSQL database

**Purpose:** App data (users, incidents, appointments, inspections, etc.)

**Not a single vendor** – you choose a provider and use its connection string.

| Option | Link | Notes |
|--------|------|--------|
| **Neon** | https://neon.tech | Free tier, serverless Postgres |
| **Supabase** | https://supabase.com | Free tier, Postgres + extras |
| **Railway** | https://railway.app | Paid, simple setup |
| **Afrihost / self-hosted** | Your VPS or DB host | Run Postgres on the same server or a separate DB server |

**Env var:**

- `DATABASE_URL` – e.g. `postgresql://user:password@host:5432/dbname?sslmode=require`

---

## 2. Cloudinary

**Purpose:** Image and file uploads (certificates, incident images, contractor docs, hazardous-chemical SDS, medicals, document library).

| What | Link |
|------|------|
| **Dashboard / API keys** | https://cloudinary.com/console |
| **Docs** | https://cloudinary.com/documentation |

**Env vars:**

- `CLOUDINARY_URL` = `cloudinary://api_key:api_secret@cloud_name`  
  **or**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (same as cloud name)
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (optional; for unsigned client uploads)

---

## 3. Resend (email)

**Purpose:** Sending emails for appointment signature requests, PPE signing links, SHE election vote links, notify appointee.

| What | Link |
|------|------|
| **Dashboard / API keys** | https://resend.com/api-keys |
| **Docs** | https://resend.com/docs |
| **Domain / sending** | https://resend.com/domains |

**Env vars:**

- `RESEND_API_KEY` – e.g. `re_xxxx`
- `RESEND_FROM` – sender address (e.g. `noreply@yourdomain.co.za`). Must use a domain you verify in Resend.

---

## 4. SMTP (alternative to Resend)

**Purpose:** Same as Resend; used only if you do **not** set `RESEND_API_KEY`. Used for SHE vote links and PPE signature emails when Resend is not configured.

**No single link** – use your own SMTP server (e.g. your host’s email, Mailgun, SendGrid, etc.).

**Env vars:**

- `SMTP_HOST` – e.g. `smtp.example.com`
- `SMTP_PORT` – e.g. `587`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` – sender address (optional; falls back to `SMTP_USER`)

---

## 5. OpenAI (optional)

**Purpose:** AI-generated risk assessments in the Risk Assessments module. If not set, users can still add risk assessments manually.

| What | Link |
|------|------|
| **API keys** | https://platform.openai.com/api-keys |
| **Usage / billing** | https://platform.openai.com/usage |

**Env var:**

- `OPENAI_API_KEY` – e.g. `sk-xxxx`

---

## 6. App URL (required for production)

**Purpose:** Used in emails and PDF links so recipients open the correct site (e.g. your Afrihost domain).

**Env var:**

- `NEXT_PUBLIC_BASE_URL` – e.g. `https://yourdomain.co.za` or `https://safety.yourcompany.co.za`

Set this to your actual Afrihost URL before going live.

---

## 7. PDF generation (Chrome/Chromium)

**Purpose:** Generating PDFs for appointments and inspections.

- On **Afrihost (Linux)** the app uses **@sparticuz/chromium** (bundled); no external API.
- Optional override: `PUPPETEER_EXECUTABLE_PATH` – path to Chrome/Chromium binary if you install it yourself (e.g. for a specific version). Not required for typical Afrihost deployment.

**No sign-up or API key** – only optional env for custom Chrome path.

---

## Summary – env vars to set on Afrihost

| Variable | Required | Service |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Your Postgres (Neon, Supabase, Railway, or self-hosted) |
| `NEXT_PUBLIC_BASE_URL` | Yes | Your app URL (e.g. https://yourdomain.co.za) |
| `CLOUDINARY_*` / `CLOUDINARY_URL` | Yes | Cloudinary |
| `RESEND_API_KEY` + `RESEND_FROM` | For email | Resend |
| **or** `SMTP_*` | For email | Your SMTP server |
| `OPENAI_API_KEY` | Optional | OpenAI |
| `PORT` | Optional | e.g. `3000` (default) |
| `PUPPETEER_EXECUTABLE_PATH` | Optional | Only if using a custom Chrome path |

---

## Quick links

| Service | Console / sign-up |
|---------|-------------------|
| **Cloudinary** | https://cloudinary.com/console |
| **Resend** | https://resend.com |
| **OpenAI** | https://platform.openai.com/api-keys |
| **Neon** | https://neon.tech |
| **Supabase** | https://supabase.com |
| **Railway** | https://railway.app |
