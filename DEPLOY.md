# Deploy to VPS via GitHub Actions

**Normal deploy:** push to `main` → GitHub builds (~8 min first time, ~3 min after) → VPS pulls and restarts (~2 min).

**No build on the VPS.** No zip uploads. No 2-hour SSH sessions.

---

## One-time setup (~15 minutes)

### 1. VPS (run once on the server)

```bash
ssh root@169.239.181.217
mkdir -p /opt/safety_system_v2
nano /opt/safety_system_v2/.env   # see .env.example for all keys
```

Minimum `.env` keys:
- `NEXT_PUBLIC_BASE_URL` — your live URL
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Or run the bootstrap script (installs Docker + creates `.env` template):

```bash
bash scripts/bootstrap-vps.sh
```

### 2. GitHub secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|--------|
| `VPS_HOST` | `169.239.181.217` |
| `VPS_USER` | SSH user (e.g. `root`) |
| `VPS_SSH_KEY` | Private SSH key (full contents) |
| `GHCR_PULL_TOKEN` | GitHub PAT with **read:packages** |

**SSH key (on your PC):**
```powershell
ssh-keygen -t ed25519 -f deploy_key -N '""'
type deploy_key.pub   # add this line to VPS ~/.ssh/authorized_keys
type deploy_key         # paste into GitHub secret VPS_SSH_KEY
```

**GHCR token:** GitHub → Settings → Developer settings → PAT → `read:packages`.

### 3. Push this repo to GitHub

```powershell
git add .
git commit -m "Add fast GitHub deploy"
git push origin main
```

Watch **Actions → Deploy to VPS**.

---

## Day-to-day deploys

| What you want | How |
|---------------|-----|
| New code live | `git push origin main` |
| Redeploy without rebuild (~2 min) | Actions → **Run workflow** → check **Redeploy only** |
| Trigger from PC | `npm run deploy` |

---

## What GitHub does each deploy

1. **Build** Docker image on GitHub (cached after first run)
2. **Push** to `ghcr.io/delanoso/--safety-system:latest`
3. **Copy** `docker-compose.prod.yml` + deploy script to VPS
4. **VPS:** pull image → migrate → restart app → health check

---

## Troubleshooting

```bash
# On VPS
cd /opt/safety_system_v2
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=50 app
curl http://localhost/api/health
```

If health fails after deploy, the old container may still be running until the new one passes health check.
