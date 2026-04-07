#!/bin/bash
# Push complete Big Hat Lawn 512AI stack to GitHub
set -e

cd ~/Claude_Projects/512ai

echo "==> Staging all BHL files..."
git add \
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
  files/_redirects \
  files/netlify.toml \
  files/deploy-portal.sh \
  files/push-widget.sh

echo "==> Committing..."
git commit -m "feat: Big Hat Lawn v3 — Rudy's real business info wired in

Updated with confirmed data from Rudy (Big Hat Lawn owner):

Voice AI (voice-bighatlawn-function.js):
  - Lily script: real pricing table ($40–$120+ by sq ft)
  - Service hours: Mon–Fri 8AM–5PM
  - Service zip codes: 78742, 78617, 78719, 78747, 78744, 78748,
    78652, 78745, 78725, 78653, 78763, 78724
  - Phone: (512) 748-2626
  - AI now qualifies yard size and gives accurate quote ranges
  - Always clarifies prices are averages, site visit confirms final

Chat Widget (widget-bighatlawn.js):
  - Greeting updated to mention SE Austin service zip codes
  - Proactive tooltip updated: Mon–Fri 8–5 schedule mention

SMS Notifications (notifications-bighatlawn.js):
  - All businessPhone fallbacks updated to (512) 748-2626

SEO (seo-bighatlawn.html):
  - Schema markup: phone +1-512-748-2626
  - Hours: Mon–Fri 08:00–17:00 (removed Saturday — Rudy is M–F only)
  - areaServed: all 12 zip codes as schema PostalCode entries
  - Meta description: real zip codes replacing [NEIGHBORHOODS]

Netlify env vars set (via MCP):
  BHL_BUSINESS_PHONE = +15127482626

Still pending from Rudy:
  - Cell/personal phone (BHL_OWNER_PHONE)
  - Business address (for schema streetAddress + postalCode)
  - Google Business Profile review link
  - LawnPro CRM access

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

echo "==> Pushing to origin main..."
git push origin main

echo ""
echo "✅ Complete stack pushed to kalelra/512ai"
echo ""
echo "─── CDN URLs (live in ~3 min) ───"
echo "Chat widget:      https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/widget-bighatlawn.js"
echo "Voice widget:     https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/voice-bighatlawn.js"
echo "Master package:   https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/bighatlawn-master.html"
echo "Client portal:    https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/client-portal-bighatlawn.html"
echo "Admin portal:     https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/admin-portal.html"
echo "SEO checklist:    https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/seo-bighatlawn.html"
echo "Deploy guide:     https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/squarespace-deploy-guide.html"
echo "QA checklist:     https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/qa-launch-checklist.html"
echo "Rudy info form:   https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/rudy-info-form.html"
