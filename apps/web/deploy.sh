#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────────────────
# Deploy lee.ai/apps/web to DigitalOcean
#
# Usage:
#   ./deploy.sh staging     # Deploy to staging (port 3001)
#   ./deploy.sh production  # Deploy to production (port 3000)
# ─────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MONO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Load server creds from claude/.env
CLAUDE_ENV="$(cd "$MONO_ROOT/.." && pwd)/.env"
if [ ! -f "$CLAUDE_ENV" ]; then
  echo "ERROR: $CLAUDE_ENV not found"
  exit 1
fi

# Parse only what we need (avoid sourcing the full file)
DO_SVR_IP=$(grep '^DO_SVR_IP=' "$CLAUDE_ENV" | cut -d= -f2)
SERVER="root@${DO_SVR_IP}"

ENV="${1:-}"
if [ "$ENV" != "staging" ] && [ "$ENV" != "production" ]; then
  echo "Usage: $0 <staging|production>"
  exit 1
fi

if [ "$ENV" = "production" ]; then
  PORT=3000
  PM2_NAME="notsaas-prod"
  DEPLOY_DIR="/srv/sites/notsaas.net/production"
else
  PORT=3001
  PM2_NAME="notsaas-staging"
  DEPLOY_DIR="/srv/sites/notsaas.net/staging"
fi

# Enforce branch
CURRENT_BRANCH=$(cd "$MONO_ROOT" && git branch --show-current)
REQUIRED_BRANCH="$ENV"

if [ "$CURRENT_BRANCH" != "$REQUIRED_BRANCH" ]; then
  echo "ERROR: ${ENV} deploys require the '${REQUIRED_BRANCH}' branch (currently on '${CURRENT_BRANCH}')"
  exit 1
fi

echo "=== Deploying to ${ENV} ==="
echo "  Server: ${DO_SVR_IP}"
echo "  Branch: ${CURRENT_BRANCH}"
echo "  Dir:    ${DEPLOY_DIR}"
echo "  Port:   ${PORT}"
echo ""

# ─── 1. Build ───────────────────────────────────────────
echo "[1/4] Building..."
cd "$MONO_ROOT"
npx turbo run build --filter=web
echo "Build complete."

# ─── 2. Sync ────────────────────────────────────────────
echo "[2/4] Syncing to server..."
STANDALONE="$SCRIPT_DIR/.next/standalone"

if [ ! -d "$STANDALONE" ]; then
  echo "ERROR: Standalone build not found at $STANDALONE"
  exit 1
fi

# Ensure persistent data dir exists (separate per env)
ssh -o StrictHostKeyChecking=no "${SERVER}" "
  mkdir -p /srv/sites/notsaas.net/shared/data-${ENV}
"

# Sync standalone build (exclude data dir — DB lives in shared/)
rsync -az --delete --force \
  -e "ssh -o StrictHostKeyChecking=no" \
  --exclude 'data' \
  "$STANDALONE/" \
  "${SERVER}:${DEPLOY_DIR}/"

# Sync static assets + public into the nested app dir (monorepo standalone structure)
APP_DIR="${DEPLOY_DIR}/apps/web"
rsync -az \
  -e "ssh -o StrictHostKeyChecking=no" \
  "$SCRIPT_DIR/.next/static/" \
  "${SERVER}:${APP_DIR}/.next/static/"

if [ -d "$SCRIPT_DIR/public" ]; then
  rsync -az \
    -e "ssh -o StrictHostKeyChecking=no" \
    "$SCRIPT_DIR/public/" \
    "${SERVER}:${APP_DIR}/public/"
fi

# Symlink shared data dir into the app's working directory
ssh -o StrictHostKeyChecking=no "${SERVER}" "
  ln -sfn /srv/sites/notsaas.net/shared/data-${ENV} ${DEPLOY_DIR}/apps/web/data
"

echo "Sync complete."

# ─── 3. Start/Restart ───────────────────────────────────
echo "[3/4] Starting ${PM2_NAME}..."
ssh -o StrictHostKeyChecking=no "${SERVER}" "
  cd ${DEPLOY_DIR}/apps/web
  if pm2 describe ${PM2_NAME} > /dev/null 2>&1; then
    PORT=${PORT} pm2 restart ${PM2_NAME} --update-env
  else
    PORT=${PORT} pm2 start server.js \
      --name ${PM2_NAME} \
      --update-env \
      --merge-logs \
      --log /var/log/${PM2_NAME}.log
  fi
  pm2 save
"
echo "PM2 process running."

# ─── 4. Verify ──────────────────────────────────────────
echo "[4/4] Verifying..."
sleep 3
STATUS=$(ssh -o StrictHostKeyChecking=no "${SERVER}" \
  "curl -so /dev/null -w '%{http_code}' --max-time 5 http://localhost:${PORT}/ 2>/dev/null")

if [ "$STATUS" = "200" ]; then
  echo ""
  echo "=== Deploy successful ==="
  echo "  ${ENV} is live on port ${PORT}"
else
  echo ""
  echo "=== WARNING: Health check returned ${STATUS} ==="
  echo "  Check logs: ssh ${SERVER} 'pm2 logs ${PM2_NAME} --lines 30'"
fi
