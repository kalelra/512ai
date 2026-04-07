#!/bin/bash
# ─── 512AI — One-time root config fix + full GitHub push ─────────────────────
# Run this from ~/Claude_Projects/512ai/files/
# It will:
#   1. Write _redirects and netlify.toml to the REPO ROOT (one level up)
#   2. Stage ALL new files/portal + updated files
#   3. Push to GitHub → Netlify auto-deploys everything
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FILES_DIR="$REPO_ROOT/files"

echo ""
echo "🔧 Repo root: $REPO_ROOT"
echo ""

# ── Step 1: Write _redirects to repo root ──────────────────────────────────
echo "==> Writing root _redirects..."
cat > "$REPO_ROOT/_redirects" << 'EOF'
# 512AI — Netlify URL rewrites (must live at repo root)
/portal    /files/portal.html    200
/widget    /files/widget-test.html    200
EOF
echo "    ✅ $REPO_ROOT/_redirects"

# ── Step 2: Write netlify.toml to repo root ────────────────────────────────
echo "==> Writing root netlify.toml..."
cat > "$REPO_ROOT/netlify.toml" << 'EOF'
[build]
  publish = "."

[[headers]]
  for = "/files/portal.html"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Cache-Control = "no-store"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "*.html"
  [headers.values]
    Cache-Control = "no-cache"
EOF
echo "    ✅ $REPO_ROOT/netlify.toml"

# ── Step 3: Stage everything ───────────────────────────────────────────────
echo "==> Staging files..."
cd "$REPO_ROOT"

git add \
  _redirects \
  netlify.toml \
  files/widget-bighatlawn.js \
  files/widget-test.html \
  files/embed-instructions.html \
  files/voice-bighatlawn.js \
  files/voice-bighatlawn-function.js \
  files/notifications-bighatlawn.js \
  files/lawnpro-webhook-bighatlawn.js \
  files/seo-bighatlawn.html \
  files/admin-portal.html \
  files/client-portal-bighatlawn.html \
  files/bighatlawn-master.html \
  files/rudy-info-form.html \
  files/qa-launch-checklist.html \
  files/squarespace-deploy-guide.html \
  files/backend-voice-route.patch \
  files/portal.html \
  files/push-widget.sh \
  files/fix-root-config.sh

# Also stage deploy-portal.sh if it exists (it will have the safety warning added)
git add files/deploy-portal.sh 2>/dev/null || true

echo "    ✅ Files staged"

# ── Step 4: Commit ─────────────────────────────────────────────────────────
echo "==> Committing..."
git commit -m "$(cat <<'COMMITMSG'
fix: restore main site + proper portal URL architecture

- Move _redirects and netlify.toml to repo root (was in files/)
- /portal now cleanly routes to /files/portal.html
- /widget routes to /files/widget-test.html
- portal.html (multi-tenant login portal) now in GitHub
- All Big Hat Lawn v3 files with Rudy's real business data
- deploy-portal.sh neutralized with safety guard

Root cause: deploy-portal.sh deployed files/ as site root,
overwriting index.html. Fixed: _redirects at root, only
push to GitHub from now on (never run deploy-portal.sh).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
COMMITMSG
)"

# ── Step 5: Push ───────────────────────────────────────────────────────────
echo "==> Pushing to origin main..."
git push origin main

echo ""
echo "✅ Done! Netlify will auto-deploy in ~60 seconds."
echo ""
echo "─── Live URLs (after deploy) ──────────────────────────────────"
echo "Main site:      https://512ai.co"
echo "Client portal:  https://512ai.co/portal"
echo "Widget test:    https://512ai.co/widget"
echo "Chat widget CDN: https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/widget-bighatlawn.js"
echo ""
