#!/usr/bin/env bash
# Fast VPS deploy — pull image, migrate, restart app only (DB stays running).
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/safety_system_v2}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
APP_IMAGE="${APP_IMAGE:?APP_IMAGE is required}"
GHCR_USER="${GHCR_USER:?GHCR_USER is required}"
GHCR_TOKEN="${GHCR_TOKEN:?GHCR_TOKEN is required}"

cd "$APP_DIR"

if [[ ! -f .env ]]; then
  echo "ERROR: $APP_DIR/.env is missing."
  echo "Create it once on the VPS (copy from .env.example). See DEPLOY.md."
  exit 1
fi

echo "==> GHCR login"
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

export APP_IMAGE

echo "==> Ensure database is up"
docker compose -f "$COMPOSE_FILE" up -d db

echo "==> Pull app image: $APP_IMAGE"
docker compose -f "$COMPOSE_FILE" pull app

echo "==> Migrations"
MIGRATE_LOG="$(mktemp)"
set +e
docker compose -f "$COMPOSE_FILE" run --rm --no-deps app \
  node node_modules/prisma/build/index.js migrate deploy 2>&1 | tee "$MIGRATE_LOG"
MIGRATE_EXIT="${PIPESTATUS[0]}"
set -e

if [[ "$MIGRATE_EXIT" -ne 0 ]]; then
  if grep -q P3005 "$MIGRATE_LOG"; then
    echo "Database exists without migration history — baselining (one-time)..."
    mapfile -t MIGRATIONS < <(
      docker compose -f "$COMPOSE_FILE" run --rm --no-deps app \
        sh -c 'ls prisma/migrations' | grep -E '^[0-9]' || true
    )
    for migration in "${MIGRATIONS[@]}"; do
      echo "  mark applied: $migration"
      docker compose -f "$COMPOSE_FILE" run --rm --no-deps app \
        node node_modules/prisma/build/index.js migrate resolve --applied "$migration" || true
    done
    docker compose -f "$COMPOSE_FILE" run --rm --no-deps app \
      node node_modules/prisma/build/index.js migrate deploy
  else
    echo "migrate deploy failed — falling back to db push"
    cat "$MIGRATE_LOG"
    docker compose -f "$COMPOSE_FILE" run --rm --no-deps app \
      node node_modules/prisma/build/index.js db push
  fi
fi
rm -f "$MIGRATE_LOG"

echo "==> Restart app (database unchanged)"
docker compose -f "$COMPOSE_FILE" up -d --no-deps --force-recreate app

echo "==> Health check"
for i in $(seq 1 12); do
  if curl -fsS http://localhost/api/health >/dev/null 2>&1; then
    echo "OK — deploy complete"
    docker compose -f "$COMPOSE_FILE" ps
    exit 0
  fi
  echo "Waiting... ($i/12)"
  sleep 2
done

echo "Health check failed — recent app logs:"
docker compose -f "$COMPOSE_FILE" logs --tail=60 app
exit 1
