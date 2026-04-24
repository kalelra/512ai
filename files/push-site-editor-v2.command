#!/bin/bash
# ─── 512AI — Site Editor v2 Deploy ────────────────────────────────────────────
# Double-click in Finder to push.
#
# What this deploys:
#   files/admin-portal.html (Site Editor v2):
#     + Structure tab (Squarespace-style page manager)
#       - All 9 sections listed with ↑↓ reorder + drag-and-drop
#       - Show/hide visibility toggle per section
#       - Edit button jumps directly to that section's tab
#       - 6 add-section templates (CTA Banner, Testimonials, FAQ,
#         Text Block, Image+Text, Custom HTML)
#     + Chat Demo tab (headline, subheading, tagline)
#     + Intake Form tab (headline, sub, form intro, submit btn, success msg)
#     + Section Settings on all tabs (background color, padding, visibility)
#     + All previously fixed selectors (About, Contact, Footer, Services)
#
# ─────────────────────────────────────────────────────────────────────────────
set -e
cd ~/Claude_Projects/512ai

echo ""
echo "==> Pulling latest..."
git pull origin main

echo ""
echo "==> Staging Site Editor v2..."
git add files/admin-portal.html

if git diff --cached --quiet; then
  echo "    No changes to commit — already up to date."
  read -p "Press Enter to close..."; exit 0
fi

echo ""
echo "==> Committing..."
git commit -m "feat: Site Editor v2 — Squarespace-style page manager + missing sections

New capabilities:
  - Structure tab: full page manager (like Squarespace)
    • All 9 sections listed in page order with drag-and-drop reorder
    • Up/down arrow buttons for section reordering
    • Visibility toggle (show/hide sections on live site)
    • Direct Edit button jumps to that section's content tab
    • 6 add-section templates (CTA Banner, Testimonials, FAQ,
      Text Block, Image+Text, Custom HTML)
  - Chat Demo tab: headline, subheading, demo tagline
  - Intake Form tab: headline, sub, form intro, submit button text,
    success message title
  - Section Settings on every content tab:
    background color, padding top/bottom, visibility checkbox
  - All selector fixes from previous pass retained

Tabs now: Structure | Nav | Hero | Services | Demo | How It Works
           | About | Intake Form | Contact | Images | Raw HTML

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

echo ""
echo "==> Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Site Editor v2 deployed! Netlify builds in ~60s."
echo ""
echo "─── Test at https://512ai.co/admin ──────────────────────────────"
echo ""
echo "  1. Login → Site Editor → Load index.html"
echo ""
echo "  2. Structure tab (first tab) should show:"
echo "     🦸 Hero | 💼 Services | 💬 Chat Demo | 🎙 Voice Demo"
echo "     📅 Scheduling | ⚙️ How It Works | 👤 About | 📋 Intake"
echo "     📬 Contact"
echo "     Each row has ↑↓ buttons, eye toggle, and ✏️ Edit button"
echo ""
echo "  3. Demo tab: headline + subheading + tagline — all populated"
echo ""
echo "  4. Intake Form tab: all 5 fields populated from live site"
echo ""
echo "  5. Section Settings (any tab) → click '⚙️ Section Settings'"
echo "     → type a bg color like #161410 → Save & Deploy"
echo "     → live site updates that section's background"
echo ""
echo "  6. Structure → click '⭐ Testimonials' → Save & Deploy"
echo "     → testimonials section appears on live site before Contact"
echo ""
read -p "Press Enter to close..."
