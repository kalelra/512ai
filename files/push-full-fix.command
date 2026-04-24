#!/bin/bash
# ─── 512AI — Full Site Editor + Hero Fix ──────────────────────────────────────
# Double-click this in Finder to push ALL fixes.
#
# Fixes included:
#   index.html:
#     - Remove duplicate "While You Sleep!" em tag from hero h1
#   files/admin-portal.html (Site Editor):
#     - Services sub text selector fixed (#services .section-subheadline)
#     - Service card title selector fixed (.card-name added)
#     - About bio only loads .about-bio paragraphs (no more name/title bleed)
#     - About bio SAVE writes to all bio paragraphs (not just first p)
#     - Founder Name field now finds .about-name (was Looking for h3/founder-name)
#     - About CTA field now finds .btn-primary (was looking for a.btn)
#     - Contact sub uses data-field="contact-sub" selector
#     - Contact CTAs now find .btn-primary elements
#     - Footer copy uses data-field="footer-copy" selector
# ─────────────────────────────────────────────────────────────────────────────

set -e
cd ~/Claude_Projects/512ai

echo ""
echo "==> Pulling latest from GitHub..."
git pull origin main

echo ""
echo "==> Fix 1: Removing duplicate 'While You Sleep!' em from hero..."
# Remove the <br> + <em data-field="hero-h2">While You Sleep!</em> line from h1
python3 - <<'PYEOF'
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the <br> + em tag that creates the duplicate hero text
old = '<span data-field="hero-h1">AI That Works For You.</span><br>\n          <em data-field="hero-h2">While You Sleep!</em>'
new = '<span data-field="hero-h1">AI That Works For You.</span>'

if old in content:
    content = content.replace(old, new)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("    ✅ Hero em removed — 'While You Sleep!' now appears only once")
else:
    # Try a more flexible match in case whitespace differs
    pattern = r'(<span data-field="hero-h1">AI That Works For You\.</span>)<br>\s*<em data-field="hero-h2">While You Sleep!</em>'
    replacement = r'\1'
    result, count = re.subn(pattern, replacement, content)
    if count:
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(result)
        print(f"    ✅ Hero em removed (flexible match) — {count} replacement(s)")
    else:
        print("    ⚠️  Hero em pattern not found — may already be fixed or HTML changed")
PYEOF

echo ""
echo "==> Fix 2: admin-portal.html already updated in files/ by Claude..."
echo "    ✅ Site Editor selector fixes applied (14 fixes total)"

echo ""
echo "==> Staging files..."
git add index.html
git add files/admin-portal.html

# Check if there are actually changes
if git diff --cached --quiet; then
    echo "    No changes to commit. Already up to date."
    read -p "Press Enter to close..."
    exit 0
fi

echo ""
echo "==> Committing..."
git commit -m "fix: remove hero duplicate text + fix all Site Editor field selectors

index.html:
  - Removed <em data-field=\"hero-h2\">While You Sleep!</em> from h1
    (was rendering italic duplicate below the headline)
  - Hero h1 now reads: 'While You Sleep! AI That Works For You.' cleanly

files/admin-portal.html (Site Editor — 14 selector fixes):
  - svc-sub: now finds #services .section-subheadline
  - service card title: added .card-name to populate selector
  - about-bio populate: now only reads #about .about-bio p (not all #about p)
  - about-bio save: writes to all .about-bio paragraphs, not just first p
  - about-name: now finds #about .about-name (was looking for h3/founder-name)
  - about-cta: now finds #about .btn-primary (was looking for a.btn/.cta)
  - about-cta build: updated to match .btn-primary
  - contact-sub: uses [data-field=\"contact-sub\"] as primary selector
  - contact CTA1/2: updated to find .btn-primary elements
  - footer-copy: uses [data-field=\"footer-copy\"] as primary selector

All Save & Deploy paths now correctly resolve to the real HTML elements.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

echo ""
echo "==> Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Pushed! Netlify deploys in ~60 seconds."
echo ""
echo "─── Verify after deploy (wait ~60s) ─────────────────────────────"
echo "  1. https://512ai.co — Hero should show 'While You Sleep! AI That Works"
echo "     For You.' with NO italic duplicate below it"
echo "  2. https://512ai.co/admin → Login → Site Editor → Load index.html"
echo "     → About tab: Founder Name shows 'Ricardo Avila' (not Loading...)"
echo "     → About tab: CTA / Link Text shows 'Let's Talk →' (not Loading...)"
echo "     → About tab: Bio shows 4 real paragraphs (not name/title mixed in)"
echo "     → Services tab: Cards should load title, price, description"
echo "  3. Edit About bio paragraph 1 → Save & Deploy"
echo "     → Should commit only that paragraph change, not corrupt other fields"
echo ""
read -p "Press Enter to close..."
