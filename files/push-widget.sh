#!/bin/bash
# Push entire Big Hat Lawn 512AI stack to GitHub
set -e

cd ~/Claude_Projects/512ai

echo "==> Staging files..."
git add \
  files/widget-bighatlawn.js \
  files/widget-test.html \
  files/embed-instructions.html \
  files/voice-bighatlawn.js \
  files/voice-bighatlawn-function.js \
  files/notifications-bighatlawn.js \
  files/seo-bighatlawn.html \
  files/admin-portal.html \
  files/client-portal-bighatlawn.html \
  files/bighatlawn-master.html \
  files/push-widget.sh

echo "==> Committing..."
git commit -m "feat: Big Hat Lawn full AI stack — chat, voice, SMS, SEO, portals

Chat Widget (v1.1) — already on CDN:
  - widget-bighatlawn.js: proactive bubble, unread badge, localStorage, minimize, timestamps
  - widget-test.html: debug test page
  - embed-instructions.html: delivery guide for bighatlawn.com

Voice AI:
  - voice-bighatlawn.js: embeddable click-to-call IIFE widget (Bland.ai, BHL-branded)
  - voice-bighatlawn-function.js: backend function w/ Lily lawn care AI script

SMS Notifications:
  - notifications-bighatlawn.js: Twilio engine (6 types: booking, reminders, complete, owner alerts)

SEO:
  - seo-bighatlawn.html: 20-item interactive Squarespace SEO checklist, GBP guide, schema markup, keywords

Portals:
  - admin-portal.html: 512AI admin config UI (manage all clients, tool toggles, config editor)
  - client-portal-bighatlawn.html: Rudy's ROI dashboard (leads, bookings, SMS, ROI, setup status)
  - bighatlawn-master.html: master delivery checklist (all tools, next actions, replication guide)

Stack ready to deploy — pending: Squarespace access, Twilio, Bland.ai key, LawnPro CRM, Rudy business details.

CDN: https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

echo "==> Pushing to origin main..."
git push origin main

echo ""
echo "✅ All files pushed to kalelra/512ai"
echo ""
echo "CDN URLs (live in ~3 min):"
echo "  Chat:    https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/widget-bighatlawn.js"
echo "  Voice:   https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/voice-bighatlawn.js"
echo "  Master:  https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/bighatlawn-master.html"
echo "  Admin:   https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/admin-portal.html"
echo "  Client:  https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/client-portal-bighatlawn.html"
echo "  SEO:     https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/seo-bighatlawn.html"
