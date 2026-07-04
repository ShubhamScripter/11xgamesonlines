#!/bin/bash
# =============================================================================
# ONE-COMMAND DEPLOY (run on the VPS)
#   cd /www/wwwroot/baajilive && ./deploy.sh
#
# Pulls latest code, rebuilds both UIs, installs backend deps, and
# (re)starts the single PM2 backend that serves user + admin.
# =============================================================================
set -e

# Always run from the repo root (this script's own folder).
cd "$(dirname "$0")"

echo "==> [1/5] Pulling latest code"
git pull

echo "==> [2/5] Building user frontend"
cd frontend
npm install
npm run build
cd ..

echo "==> [3/5] Building admin panel"
cd admin
npm install
npm run build
cd ..

echo "==> [4/5] Installing backend dependencies"
cd aura-backend
npm install

echo "==> [5/5] (Re)starting backend via PM2"
# Use project-local PM2 (devDependency) — global `pm2` is often missing in aaPanel shells.
PM2_BIN="./node_modules/.bin/pm2"
if [ ! -x "$PM2_BIN" ]; then
  PM2_BIN="npx --no-install pm2"
fi
# startOrReload = start if not running, otherwise zero-downtime reload.
$PM2_BIN startOrReload ecosystem.config.cjs --env production
$PM2_BIN save
cd ..

echo ""
echo "==> Deploy complete."
cd aura-backend && $PM2_BIN status
