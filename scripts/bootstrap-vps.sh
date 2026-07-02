#!/usr/bin/env bash
# One-time VPS setup. Run on the server as root or with sudo:
#   curl -fsSL https://raw.githubusercontent.com/Delanoso/--safety-system/main/scripts/bootstrap-vps.sh | bash
# Or copy this file to the VPS and run: bash bootstrap-vps.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/safety_system_v2}"

echo "==> Installing Docker (if needed)"
if ! command -v docker >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "${VERSION_CODENAME:-jammy}") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

echo "==> App directory: $APP_DIR"
mkdir -p "$APP_DIR/scripts"

if [[ ! -f "$APP_DIR/.env" ]]; then
  cat > "$APP_DIR/.env" <<'EOF'
# Edit these before first deploy:
DATABASE_URL=postgresql://safety:safety@db:5432/safety
NEXT_PUBLIC_BASE_URL=https://your-domain.com
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EOF
  echo "Created $APP_DIR/.env — edit it with your real values before deploying."
else
  echo ".env already exists — left unchanged."
fi

echo ""
echo "Next steps:"
echo "  1. Edit $APP_DIR/.env"
echo "  2. Add GitHub Actions secrets (VPS_HOST, VPS_USER, VPS_SSH_KEY, GHCR_PULL_TOKEN)"
echo "  3. Push to main or run: gh workflow run deploy.yml"
echo ""
echo "Bootstrap complete."
