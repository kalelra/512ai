#!/bin/bash
# Double-click this file in Finder to push the nav href fix to GitHub.
# Fixes: logo href="#home" → "#hero"  |  Chat Demo href="#chatdemo" → "#demo"

cd ~/Claude_Projects/512ai

echo ""
echo "==> Pulling latest from GitHub first..."
git pull origin main

echo ""
echo "==> Applying nav href fixes..."
# Fix 1: logo anchor
sed -i '' 's/href="#home" class="nav-logo"/href="#hero" class="nav-logo"/g' index.html

# Fix 2: Chat Demo link
sed -i '' 's/href="#chatdemo">Chat Demo<\/a>/href="#demo">Chat Demo<\/a>/g' index.html

# Verify
if grep -q 'href="#hero" class="nav-logo"' index.html && grep -q 'href="#demo">Chat Demo' index.html; then
    echo "    ✅ Both href fixes verified in file"
else
    echo "    ❌ Fix verification failed — aborting"
    read -p "Press Enter to close..."
    exit 1
fi

echo ""
echo "==> Committing..."
git add index.html
git commit -m "fix: restore broken nav hrefs in index.html

Logo href: #home -> #hero
Chat Demo href: #chatdemo -> #demo

These were corrupted by the Site Editor on the previous save.
Section IDs (id='hero', id='demo') were always correct.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

echo ""
echo "==> Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Netlify will deploy in ~60 seconds."
echo "   Test at: https://512ai.co"
echo "   - Click '512AI' logo → should scroll to hero section"
echo "   - Click 'Chat Demo' in nav → should scroll to demo section"
echo ""
read -p "Press Enter to close..."
