#!/bin/bash
# Push Big Hat Lawn widget v1.1 + embed instructions to GitHub
set -e

cd ~/Claude_Projects/512ai

echo "==> Staging files..."
git add files/widget-bighatlawn.js files/widget-test.html files/embed-instructions.html files/push-widget.sh

echo "==> Committing..."
git commit -m "feat: Big Hat Lawn widget v1.1 + embed delivery package

widget-bighatlawn.js v1.1:
- Proactive tooltip bubble (8s delay, auto-dismiss 12s, dismissible)
- Unread message badge with count on launcher button
- localStorage session persistence (survives page refresh)
- Minimize button to collapse panel without closing
- Launcher icon animates chat↔close with rotation
- Timestamps on every message (HH:MM format)
- Send button disabled when input is empty
- Online pulse animation dot in header
- Powered-by bar in footer
- BHL_OPEN() / BHL_CLOSE() global JS API
- Higher z-index (2147483646/2147483647) for max stacking
- Mobile: 88dvh bottom sheet on screens < 480px
- Close on outside click + Escape key support

embed-instructions.html:
- Professional delivery package for Rudy's web developer
- Single CDN embed snippet (jsDelivr from kalelra/512ai)
- Platform guides: WordPress, Squarespace, Wix, Webflow, Shopify, HTML
- 16-feature checklist, CONFIG reference, JS API docs
- Copy-to-clipboard button for embed code
- Sample test messages for QA verification

CDN URL: https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/widget-bighatlawn.js

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

echo "==> Pushing to origin main..."
git push origin main

echo ""
echo "✅ Done! Files pushed:"
echo "  files/widget-bighatlawn.js   (v1.1)"
echo "  files/widget-test.html"
echo "  files/embed-instructions.html"
echo "  files/push-widget.sh"
echo ""
echo "CDN (live in ~3 min):"
echo "  https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/widget-bighatlawn.js"
echo "  https://cdn.jsdelivr.net/gh/kalelra/512ai@main/files/embed-instructions.html"
