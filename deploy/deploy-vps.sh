#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-103.94.238.207}"
VPS_USER="${VPS_USER:-ispkita}"
SSH_KEY="${SSH_KEY:-./ispkita.ppk.pem}"
REMOTE_DIR="${REMOTE_DIR:-/home/ispkita/redios-platform}"
OPENSSH_KEY="${OPENSSH_KEY:-/tmp/ispkita_openssh.pem}"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -f "$ROOT_DIR/$SSH_KEY" && ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found: $SSH_KEY"
  exit 1
fi

KEY_PATH="$SSH_KEY"
if [[ ! -f "$KEY_PATH" ]]; then
  KEY_PATH="$ROOT_DIR/$SSH_KEY"
fi

if grep -q "PuTTY-User-Key-File" "$KEY_PATH" 2>/dev/null; then
  puttygen "$KEY_PATH" -O private-openssh -o "$OPENSSH_KEY"
  chmod 600 "$OPENSSH_KEY"
  KEY_PATH="$OPENSSH_KEY"
fi

SSH=(ssh -o StrictHostKeyChecking=accept-new -i "$KEY_PATH" "${VPS_USER}@${VPS_HOST}")
RSYNC=(rsync -az --delete
  --exclude node_modules
  --exclude dist
  --exclude .git
  --exclude ispkita.ppk.pem
  --exclude deploy/.env
  -e "ssh -i $KEY_PATH -o StrictHostKeyChecking=accept-new"
)

echo ">> Syncing project to ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}"
"${RSYNC[@]}" "$ROOT_DIR/" "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"

echo ">> Building and starting containers"
"${SSH[@]}" bash -s <<EOF
set -euo pipefail
cd "$REMOTE_DIR/deploy"

if [[ ! -f .env ]]; then
  JWT_SECRET=\$(openssl rand -hex 32)
  cat > .env <<ENV
JWT_SECRET=\${JWT_SECRET}
AUTH_MODE=jwt
JWT_EXPIRES_IN=8h
REDIOS_DEFAULT_DOMAIN_CODE=DEFAULT
REDIOS_DEFAULT_APPLICATION_CODE=ASSET_MAINTENANCE
REDIOS_WEB_PORT=3040
REDIOS_API_PORT=3041
ENV
  echo "Created deploy/.env with generated JWT_SECRET"
fi

sudo docker compose -f docker-compose.prod.yml --env-file .env up -d --build

echo ">> Waiting for API health"
for i in \$(seq 1 30); do
  if curl -sf http://127.0.0.1:3041/api/health >/dev/null 2>&1; then
    echo "API healthy"
    break
  fi
  sleep 3
done

echo ">> Running metadata seed (platform + metadata + compile)"
sudo docker compose -f docker-compose.prod.yml --env-file .env exec -T api node dist/apps/api/src/seed/main.js || true

echo ">> Deployment status"
sudo docker compose -f docker-compose.prod.yml --env-file .env ps
EOF

echo
echo "RediOS deployed:"
echo "  Web: http://${VPS_HOST}:3040"
echo "  API: http://${VPS_HOST}:3041/api"
echo "  Login: admin@redios.local / admin123"
