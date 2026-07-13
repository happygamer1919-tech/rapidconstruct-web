#!/usr/bin/env bash
# RC-001 — one-time scaffold of the Next.js app into the repo root.
# Safe to re-run: refuses to overwrite an existing app.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f package.json ]; then
  echo "package.json already exists — app is scaffolded. Nothing to do."
  echo "Run: npm run dev"
  exit 0
fi

command -v node >/dev/null || { echo "ERROR: node is not installed"; exit 1; }
echo "Node $(node --version), npm $(npm --version)"

echo "==> Scaffolding Next.js (App Router, TypeScript, Tailwind, ESLint)..."
npx --yes create-next-app@latest . \
  --typescript --app --tailwind --eslint \
  --src-dir --import-alias "@/*" \
  --no-turbopack --use-npm --yes

echo "==> Installing project dependencies..."
npm install next-intl motion
npm install --save-dev @playwright/test

echo "==> Writing .env.example..."
cat > .env.example <<'EOF'
# Copy to .env.local and fill in. Never commit .env.local.
# Lead delivery (RC-105, pending Q-03)
LEAD_EMAIL_TO=rapidconstructmd@gmail.com
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EOF

echo
echo "Done. Next steps:"
echo "  npm run dev            # local dev server"
echo "  npx playwright install # once, for smoke tests (RC-007)"
echo
echo "Continue with backlog ticket RC-002 (Vercel + GitHub wiring)."
