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
  files/push-widget.sh

echo "==> Committing..."
git commit -m "feat: Big Hat Lawn complete launch-ready stack v2

Chat Widget (v1.1) — on CDN, ready to deploy:
  widget-bighatlawn.js, widget-test.html, embed-instructions.html

Voice AI — built, pending Bland.ai key:
  voice-bighatlawn.js        (embeddable click-to-call widget)
  voice-bighatlawn-function.js (Bland.ai Netlify function)
  backend-voice-route.patch  (Railway /api/v1/voice/call route)

SMS Notifications — built, pending Twilio:
  notifications-bighatlawn.js (6 SMS types, Twilio engine)

CRM Integration — built, pending LawnPro access:
  lawnpro-webhook-bighatlawn.js (webhook handler: job created/completed)

SEO Package:
  seo-bighatlawn.html  (20-item interactive Squarespace SEO checklist)

Portals:
  admin-portal.html              (512AI multi-client admin dashboard)
  client-portal-bighatlawn.html  (Rudy's ROI + setup status portal)
  bighatlawn-master.html         (master delivery + next actions)

Launch Prep:
  rudy-info-form.html            (business info collection form for Rudy)
  qa-launch-checklist.html       (24-test pre-launch QA checklist)
  squarespace-deploy-guide.html  (14-step Squarespace injection guide)

Stack complete. Blocked only on: Squarespace access, Bland.ai key,
Twilio credentials, LawnPro API key, Rudy's business details.

When credentials arrive → Ricardo sets env vars via Netlify/Railway MCP
and deploys everything live in one session.

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
