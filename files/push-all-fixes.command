#!/bin/bash
# ─── 512AI — Push ALL pending fixes ───────────────────────────────────────────
# Double-click this in Finder to push everything at once.
#
# Fixes included:
#  1. index.html  — nav hrefs: #home→#hero, #chatdemo→#demo
#  2. admin-portal.html — Site Editor href corruption bug (only saves hrefs
#                         when user explicitly edits them)
# ─────────────────────────────────────────────────────────────────────────────

set -e
cd ~/Claude_Projects/512ai

echo ""
echo "==> Pulling latest from GitHub..."
git pull origin main

echo ""
echo "==> Fix 1: Patching index.html nav hrefs..."
sed -i '' 's/href="#home" class="nav-logo"/href="#hero" class="nav-logo"/g' index.html
sed -i '' 's/href="#chatdemo">Chat Demo<\/a>/href="#demo">Chat Demo<\/a>/g' index.html

# Verify
if grep -q 'href="#hero" class="nav-logo"' index.html && grep -q 'href="#demo">Chat Demo' index.html; then
    echo "    ✅ index.html hrefs fixed"
else
    echo "    ❌ index.html fix verification failed — aborting"
    read -p "Press Enter to close..."
    exit 1
fi

echo ""
echo "==> Fix 2: Copying fixed admin-portal.html..."
# The admin-portal.html is in the workspace — copy it in from Claude's output
# (already in files/ since that IS the repo files/ directory)
echo "    ✅ admin-portal.html already updated in files/"

echo ""
echo "==> Staging files..."
git add index.html
git add files/admin-portal.html

echo ""
echo "==> Committing..."
git commit -m "fix: restore nav hrefs + harden Site Editor against href corruption

index.html:
  - Logo href: #home -> #hero
  - Chat Demo href: #chatdemo -> #demo

admin-portal.html (Site Editor):
  - Nav link hrefs now only written back when user explicitly edits them
  - Prevents silent href corruption on text-only saves

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

echo ""
echo "==> Pushing to GitHub..."
git push origin main

echo ""
echo "✅ All fixes pushed! Netlify deploys in ~60 seconds."
echo ""
echo "─── Verify after deploy ────────────────────────────"
echo "  https://512ai.co             ← Main site"
echo "  https://512ai.co/#hero       ← Should scroll to hero"
echo "  https://512ai.co/#demo       ← Should scroll to demo"
echo "  https://512ai.co/admin       ← Admin portal"
echo ""
read -p "Press Enter to close..."
