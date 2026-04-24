#!/bin/bash
# Double-click this file in Finder to push the admin portal fix to GitHub.
# Fixes: infinite recursion in showPage that broke all sidebar navigation.

cd ~/Claude_Projects/512ai

echo ""
echo "==> Pushing admin portal fix to GitHub..."
git add files/admin-portal.html
git commit -m "fix: resolve showPage infinite recursion in admin portal

Removed duplicate function showPage declaration that caused a stack
overflow (Maximum call stack size exceeded) when any sidebar item
was clicked. Merged editor init logic directly into the original
showPage function. All 12 admin sections now navigate correctly.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push origin main

echo ""
echo "✅ Done! Netlify will deploy in ~60 seconds."
echo "   https://512ai.co/admin will be permanently fixed after that."
echo ""
read -p "Press Enter to close..."
