#!/bin/bash
set -euo pipefail

# Prerequisite: run ssh-keyscan $DO_SVR_IP >> ~/.ssh/known_hosts

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

# App runtime env vars (from the gitignored project .env) to hand to the pm2
# process via --update-env. Without these the deployed server has no Mailgun
# config and lead-notification emails can't send.
APP_ENV_FILE="$MONO_ROOT/.env"
APP_ENV_EXPORTS=""
for VAR in MAILGUN_API_KEY MAILGUN_DOMAIN MAILGUN_FROM LEADS_NOTIFY_EMAIL IP_SALT; do
  LINE=$(grep "^${VAR}=" "$APP_ENV_FILE" 2>/dev/null | head -1) || true
  [ -z "$LINE" ] && continue
  VAL=${LINE#*=}
  # strip one layer of surrounding quotes if present
  VAL=$(printf '%s' "$VAL" | sed -E "s/^[\"']//; s/[\"']\$//")
  # single-quote-escape (' -> '\'') for safe eval in the remote shell
  ESC=$(printf '%s' "$VAL" | sed "s/'/'\\\\''/g")
  APP_ENV_EXPORTS="${APP_ENV_EXPORTS}export ${VAR}='${ESC}'
"
done

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

# Pack standalone + static + public into one tar, transfer, extract
echo "  Packing build..."
PACK_DIR=$(mktemp -d)
cp -a "$STANDALONE/." "$PACK_DIR/"
mkdir -p "$PACK_DIR/apps/web/.next"
cp -a "$SCRIPT_DIR/.next/static" "$PACK_DIR/apps/web/.next/static"
[ -d "$SCRIPT_DIR/public" ] && cp -a "$SCRIPT_DIR/public" "$PACK_DIR/apps/web/public"
tar czf /tmp/notsaas-deploy.tar.gz -C "$PACK_DIR" --exclude='data' .
rm -rf "$PACK_DIR"

echo "  Transferring $(du -h /tmp/notsaas-deploy.tar.gz | cut -f1)..."
scp -o StrictHostKeyChecking=no /tmp/notsaas-deploy.tar.gz "${SERVER}:/tmp/notsaas-deploy.tar.gz"
ssh -o StrictHostKeyChecking=no "${SERVER}" "
  rm -rf ${DEPLOY_DIR}/*
  tar xzf /tmp/notsaas-deploy.tar.gz -C ${DEPLOY_DIR}/
  rm /tmp/notsaas-deploy.tar.gz
"
rm /tmp/notsaas-deploy.tar.gz

# Symlink shared data dir into the app's working directory
ssh -o StrictHostKeyChecking=no "${SERVER}" "
  ln -sfn /srv/sites/notsaas.net/shared/data-${ENV} ${DEPLOY_DIR}/apps/web/data
  chmod 600 /srv/sites/notsaas.net/shared/data-${ENV}/assessments.db 2>/dev/null || true
"

# Install the native better-sqlite3 binary for Linux.
# The bundle is built on macOS, so any shipped better_sqlite3.node is a Mach-O
# binary; worse, under a pnpm node_modules layout the standalone trace often
# omits the compiled .node entirely (→ "Could not locate the bindings file").
# Either way the app can't open the DB ("Failed to save assessment"). So fetch
# the matching Linux prebuilt and PLACE it into every bundled better-sqlite3
# package's build/Release (creating the dir if needed), rather than only
# replacing an existing file. -type d matches the real package dir in both
# npm-flat and pnpm (.pnpm/...) layouts; the pnpm symlink is skipped.
echo "  Installing Linux native better-sqlite3 binary..."
ssh -o StrictHostKeyChecking=no "${SERVER}" "
  set -e
  TMP=\$(mktemp -d)
  trap 'rm -rf \"\$TMP\"' EXIT
  PKG=\$(find ${DEPLOY_DIR} -type d -name better-sqlite3 | head -1)
  if [ -z \"\$PKG\" ] || [ ! -f \"\$PKG/package.json\" ]; then echo 'ERROR: better-sqlite3 package not found in deploy'; exit 1; fi
  BS3_VER=\$(node -e \"process.stdout.write(require('\$PKG/package.json').version)\")
  cd \"\$TMP\"
  npm init -y >/dev/null 2>&1
  npm install better-sqlite3@\$BS3_VER --no-audit --no-fund >/dev/null 2>&1
  SRC=\"\$TMP/node_modules/better-sqlite3/build/Release/better_sqlite3.node\"
  if ! file \"\$SRC\" | grep -qE 'ELF.*x86-64'; then echo 'ERROR: did not obtain a Linux x86-64 better-sqlite3 binary'; exit 1; fi
  find ${DEPLOY_DIR} -type d -name better-sqlite3 | while read -r D; do
    [ -f \"\$D/package.json\" ] || continue
    mkdir -p \"\$D/build/Release\"
    cp -f \"\$SRC\" \"\$D/build/Release/better_sqlite3.node\"
  done
  echo \"    better-sqlite3 @\$BS3_VER (linux x86-64) installed\"
"

echo "Sync complete."

# ─── 3. Start/Restart ───────────────────────────────────
echo "[3/4] Starting ${PM2_NAME}..."
ssh -o StrictHostKeyChecking=no "${SERVER}" "
  cd ${DEPLOY_DIR}/apps/web
  ${APP_ENV_EXPORTS}if pm2 describe ${PM2_NAME} > /dev/null 2>&1; then
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
