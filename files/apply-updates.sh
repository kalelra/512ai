#!/bin/bash
set -e
echo "==> Cloning 512ai-backend..."
cd ~/Claude_Projects
if [ ! -d "512ai-backend" ]; then
  git clone https://github.com/kalelra/512ai-backend
fi
cd 512ai-backend
git checkout main && git pull origin main

echo "==> Applying updates patch..."
git am < ~/Downloads/512ai-backend-updates.patch

echo "==> Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Check: https://github.com/kalelra/512ai-backend/blob/main/docs/BUSINESS_MASTER.md"
