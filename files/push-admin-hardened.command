#!/bin/bash
# ─── Push hardened admin-portal.html to GitHub ────────────────────────────────
# Fixes in this version:
#  1. Hero H1 populate bug fixed (was duplicating "While You Sleep!" in form)
#  2. ALL form fields now only write back to HTML when explicitly changed by user
#     (prevents silent data corruption on every save)
#  3. Activity Log (SRE) added — logs logins, deploys, health checks to localStorage
#  4. Auto health check on every login — verifies 512ai.co is live
#  5. Post-deploy auto-verification — confirms site is live 65s after commit
# ─────────────────────────────────────────────────────────────────────────────

set -e
cd ~/Claude_Projects/512ai

echo ""
echo "==> Pulling latest from GitHub..."
git pull origin main

echo ""
echo "==> Staging admin-portal.html..."
git add files/admin-portal.html

# Check if there are actually changes
if git diff --cached --quiet; then
    echo "    No changes to commit. Already up to date."
    read -p "Press Enter to close..."
    exit 0
fi

echo ""
echo "==> Committing..."
git commit -m "fix: harden admin portal — site editor corruption fixes + SRE activity log

Site Editor fixes:
  - Hero H1 populate: now extracts only direct text nodes (not em child)
    Previously: 'While You Sleep!           While You Sleep!' (duplicated)
    Now:        'While You Sleep!' (correct)
  - ALL form fields now only write to HTML when user explicitly edits them
    (changed class guard on every field — nav, hero, services, how, about, contact, footer)
  - Nav link hrefs: already guarded, now also text requires changed class

SRE / Activity Log:
  - New 'Activity Log' sidebar section (page-sre-log)
  - Persistent log in localStorage (200 entries, survives sessions)
  - Logs: logins, logouts, deploys, health checks, editor loads, errors
  - Auto health check on every login (fetches 512ai.co, verifies hero section)
  - Post-deploy auto-verification 65s after GitHub commit
  - GitHub latest commit shown on health check

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

echo ""
echo "==> Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Pushed! Netlify deploys in ~60s."
echo ""
echo "─── Test checklist (do after ~60s) ──────────────────────────"
echo "  1. Go to 512ai.co/admin → log in → open Activity Log sidebar"
echo "     → Should show login event + 2 health check entries"
echo "  2. Open Site Editor → load index.html"
echo "     → Hero H1a field should show 'While You Sleep!' (not duplicated)"
echo "  3. Change Hero H1a text slightly → Save & Deploy"
echo "     → Only that field should update in the committed HTML"
echo "  4. Check Activity Log → should show deploy event + post-deploy health check"
echo ""
read -p "Press Enter to close..."
