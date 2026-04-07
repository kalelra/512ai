#!/bin/bash
# ─── 512AI — DEPRECATED: DO NOT RUN THIS SCRIPT ───────────────────────────────
#
# ⚠️  WARNING: This script previously destroyed 512ai.co by deploying
#     the files/ subdirectory as the Netlify site root, overwriting index.html.
#
# ✅  CORRECT WAY TO DEPLOY:
#     1. Make your changes in ~/Claude_Projects/512ai/files/
#     2. Run: bash fix-root-config.sh   (first time only, or after new files)
#        OR:  bash push-widget.sh       (for subsequent pushes)
#     3. Netlify auto-deploys from GitHub — no manual netlify deploy needed.
#
# This script is intentionally disabled.
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo "❌  STOPPED: deploy-portal.sh is disabled."
echo ""
echo "    This script previously overwrote 512ai.co by deploying"
echo "    files/ as the site root instead of the repo root."
echo ""
echo "    ✅  To deploy changes, run instead:"
echo "        bash push-widget.sh"
echo ""
echo "    Netlify auto-deploys from GitHub. No manual netlify CLI needed."
echo ""
exit 1

# ─── DISABLED CODE BELOW ──────────────────────────────────────────────────────
: << 'DISABLED'

set -e

SITE_ID="889eddd7-8316-477c-975a-7b971a6d5012"
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "🚀 Deploying 512AI portal to https://512ai.co"
echo "📁 Deploy directory: $DEPLOY_DIR"
echo ""

# Check netlify-cli is available
if ! command -v netlify &> /dev/null; then
  echo "⚠️  netlify-cli not found. Installing..."
  npm install -g netlify-cli
fi

# Deploy
netlify deploy \
  --prod \
  --dir "$DEPLOY_DIR" \
  --site "$SITE_ID" \
  --message "512AI portal update — $(date '+%Y-%m-%d %H:%M')"

echo ""
echo "✅ Deployed!"
echo ""
echo "─── Live URLs ───────────────────────────────────"
echo "Client Portal:   https://512ai.co/portal"
echo "Chat Widget CDN: https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/widget-bighatlawn.js"
echo "Admin Portal:    https://512ai.co/portal  (login: admin)"
echo ""
echo "─── Login Credentials ───────────────────────────"
echo "Rudy (Big Hat Lawn)"
echo "  Username: rudy"
echo "  Password: BigHat512!"
echo ""
echo "Admin (Diskat)"
echo "  Username: admin"
echo "  Password: 512admin2026!"
echo ""
