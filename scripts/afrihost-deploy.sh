#!/bin/bash
# Afrihost VPS deploy script – run this ON the server after SSH'ing in
# Usage: bash afrihost-deploy.sh

set -e
echo "=== Safety System – Afrihost Deploy ==="

# Change to your project path (update if different)
APP_DIR="${APP_DIR:-$HOME/safety_system_v2}"
cd "$APP_DIR" || exit 1

echo "→ Installing dependencies..."
npm install

echo "→ Prisma generate..."
npx prisma generate

echo "→ Database schema..."
npx prisma db push

echo "→ Build..."
npm run build

echo "→ Copy static assets to standalone..."
node scripts/copy-standalone-assets.js 2>/dev/null || true

echo "=== Done. Start with: pm2 start npm --name safety-system -- start ==="
echo "  Or: cd .next/standalone && PORT=3000 node server.js"
