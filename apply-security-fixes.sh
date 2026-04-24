#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# 512AI SECURITY FIX SCRIPT
# Run from ~/Claude_Projects/512ai/ (frontend repo)
# ═══════════════════════════════════════════════════════════════════
set -e

echo "═══════════════════════════════════════════════════"
echo "  512AI Security Fixes — $(date)"
echo "═══════════════════════════════════════════════════"

# ── CONFIG ─────────────────────────────────────────
# NEW credentials (generated fresh — never committed anywhere public)
NEW_API_KEY="512ai_db1fa21876bb6de02e7e6e3198d6c21e8f41a319"
NEW_API_KEY_HASH="efe124f08c6210e63226305eaec9c2ea7975a0b06a4a59f19d97ee12fd8bc712"

NEW_ADMIN_PASS="512Adm!339d02fc"
NEW_ADMIN_HASH="40c6d0f7ba46b132ef900f9631d0797a3d6d2c8a239df65409b38e74bc243db4"

NEW_RUDY_PASS="BHL9abd0b73!"
NEW_RUDY_HASH="c6a8caf700cbb4088022d541ed4634a58bdeb5dcab39d3df913002ad57a5b1de"

NEW_DEMO_ADMIN_PASS="512Demoa53da7e7!"
NEW_DEMO_ADMIN_HASH="07e522d64907a41f4a61c908d7dd622cf44730dc0f93eb0ce321bd97b0086fc9"

OLD_API_KEY="512ai_713664dd917ee4ee35dfc569e109703f"

# ── SAFETY CHECK ───────────────────────────────────
if [ ! -f "index.html" ]; then
  echo "❌ ERROR: Run this from the 512ai frontend repo root (where index.html is)"
  exit 1
fi

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│  FIX 1: Update _redirects to block files    │"
echo "└─────────────────────────────────────────────┘"

cat > _redirects << 'REDIRECTS_EOF'
# 512AI — Netlify URL rewrites + security rules
# SECURITY: Block access to sensitive files (top-down, first match wins)
# Force rules (!) override even if the file exists on disk

# Block internal/dev files
/STATE.md     /index.html  404!
/CLAUDE.md    /index.html  404!

# Block editor directory
/editor/*     /index.html  404!

# Block server-side source code served as static files
/netlify/functions/voice-demo.js                 /index.html  404!
/netlify/functions/claude-proxy.js               /index.html  404!
/netlify/functions/voice-bighatlawn-function.js   /index.html  404!

# Block server-side business logic files
/files/voice-bighatlawn.js              /index.html  404!
/files/notifications-bighatlawn.js      /index.html  404!
/files/lawnpro-webhook-bighatlawn.js    /index.html  404!
/files/scheduling-engine.js             /index.html  404!

# Nice URL rewrites (keep existing)
/portal    /files/portal.html         200
/admin     /files/admin-portal.html   200
/widget    /files/widget-test.html    200
/bighatlawndemo  /files/bighatlawndemo.html  200
/bighatlawndemo/*  /files/bighatlawndemo.html  200
REDIRECTS_EOF

echo "✅ _redirects updated"

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│  FIX 2: Remove plaintext password from      │"
echo "│         admin-portal.html                    │"
echo "└─────────────────────────────────────────────┘"

# Remove the plaintext password from the code comment
sed -i.bak "s|// 512Admin!2026||g" files/admin-portal.html

# Remove the plaintext password from the credentials display section
sed -i "s|password: <strong>512Admin!2026</strong>|password: <strong>••••••••</strong> <em style=\"font-size:11px;color:#999\">(stored securely)</em>|g" files/admin-portal.html

# Update the admin hash to the new password
sed -i "s|b09e90c0da55f11aa3e7b54fc6d47037e067e98ead22340c36898120fd1fba43|${NEW_ADMIN_HASH}|g" files/admin-portal.html

echo "✅ admin-portal.html — password comment removed, hash rotated"

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│  FIX 3: Remove credentials from             │"
echo "│         bighatlawndemo.html admin tab        │"
echo "└─────────────────────────────────────────────┘"

# Replace the credential table with a "credentials delivered separately" message
sed -i "s|<tr><td style=\"padding:8px 6px\">Client</td><td style=\"padding:8px 6px;font-family:monospace\">rudy</td><td style=\"padding:8px 6px;font-family:monospace\">BigHatLawn2026!</td></tr>|<tr><td style=\"padding:8px 6px\" colspan=\"3\"><em style=\"color:#6b7280\">Credentials delivered via secure channel. Contact Ricardo if needed.</em></td></tr>|g" files/bighatlawndemo.html

# Remove the admin credentials row entirely
sed -i "/512AI@Admin2026!/d" files/bighatlawndemo.html

# Update the demo page password hashes for rudy login
sed -i "s|29e4ef938e2172fb680f3043626b9dcdd00fe758b18d0664a51dba80e9e57023|${NEW_RUDY_HASH}|g" files/bighatlawndemo.html

echo "✅ bighatlawndemo.html — credentials removed from source, hashes rotated"

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│  FIX 4: Rotate API key in all frontend      │"
echo "│         files                                │"
echo "└─────────────────────────────────────────────┘"

# Find and replace old API key in all files
FILES_WITH_KEY=$(grep -rl "${OLD_API_KEY}" . --include="*.html" --include="*.js" --include="*.md" 2>/dev/null || true)

if [ -n "$FILES_WITH_KEY" ]; then
  for f in $FILES_WITH_KEY; do
    sed -i "s|${OLD_API_KEY}|${NEW_API_KEY}|g" "$f"
    echo "   Updated: $f"
  done
else
  echo "   ⚠️  Old API key not found in any files (may already be rotated)"
fi

echo "✅ API key rotated in frontend files"

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│  FIX 5: Clean STATE.md of sensitive data    │"
echo "└─────────────────────────────────────────────┘"

# Rewrite STATE.md without credentials
cat > STATE.md << 'STATE_EOF'
# 512AI — Project State
> Last updated: 2026-04-24 | Session: Security audit + credential rotation

## Repos
| Repo | Notes |
|------|-------|
| kalelra/512ai | Netlify auto-deploy, frontend + demo files |
| kalelra/512ai-backend | Railway auto-deploy, Express API |
| kalelra/512ai-skills | QA skill + teaching agent |

## Infrastructure — All Live
| Service | Status | Notes |
|---------|--------|-------|
| Railway backend | ✅ Live | Auto-booking, SMS workflow, all routes |
| Supabase | ✅ Healthy | 10 tables: +customers, payments, crm_sync_log |
| Netlify | ✅ Live | Paid plan |
| Bland.ai | ✅ Live | Real calls, SANDBOX_MODE=false |
| Twilio | ✅ Live | SMS confirmed working |

## AI Agent Names — CRITICAL
- **Divi** = AI for ALL client sites (Big Hat Lawn + future)
- **Zoe** = AI for 512ai.co ONLY

## Big Hat Lawn — Rudy
- Tenant + API key: see secure vault (~/.config/512ai/.env)
- Demo: 512ai.co/bighatlawndemo — credentials delivered securely
- Hours: Mon-Fri 8-5

## Full Loop — LIVE ✅
Customer chats Divi → info collected → booking auto-created → Rudy SMS alert → Rudy confirms → Customer SMS

## Widget — bighatlawn.com
- URL: https://512ai.co/widget-bighatlawn.js?v=3 (Squarespace Code Injection footer)

## LawnPro + Zapier
- Backend fully built, Zaps drafted, blocked on Rudy's LawnPro API plan

## QA Rules
- NEVER call/text/email real people in QA tests
- node --check every JS file before pushing
- Netlify CDN: always cache-bust with ?v=N on script tags

## Security
- API keys, tenant IDs, passwords: NEVER in public files
- All credentials in ~/.config/512ai/.env ONLY
- _redirects blocks STATE.md, CLAUDE.md, server-side JS

## Next Priorities
1. Architecture overhaul — ZOE_CONFIG→tenant config, multi-tenancy
2. Zoe (512ai.co) — update to same quality as Divi
3. LawnPro Zapier — activate when Rudy gets API plan
4. Google Maps lot-size — Phase 2
5. 2nd client onboarding
STATE_EOF

echo "✅ STATE.md cleaned — no credentials"

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│  FIX 6: Update portal.html password hashes  │"
echo "└─────────────────────────────────────────────┘"

# Update portal.html hashes
sed -i "s|0c66c91714d863bc9882ecd0d2fdb39573ffa08c4f10541c74b589ddc2f8f48a|${NEW_RUDY_HASH}|g" files/portal.html
sed -i "s|1756e48afff6b6189530326347a0d0141a6e2d89f12ea0b3e650f9f0cfa97a2d|${NEW_DEMO_ADMIN_HASH}|g" files/portal.html

echo "✅ portal.html — password hashes rotated"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  FRONTEND FIXES COMPLETE"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  Clean up backup files:"
echo "  rm -f files/admin-portal.html.bak"
echo ""
echo "  Review changes:"
echo "  git diff"
echo ""
echo "  Commit and push:"
echo "  git add -A && git commit -m 'security: rotate credentials, block sensitive files, fix exposures' && git push"
echo ""
echo "═══════════════════════════════════════════════════"
echo "  ⚠️  MANUAL STEPS STILL NEEDED (see below)"  
echo "═══════════════════════════════════════════════════"
echo ""
echo "  1. SUPABASE — Update BHL tenant API key hash:"
echo "     UPDATE tenants SET api_key_hash = '${NEW_API_KEY_HASH}'"
echo "     WHERE id = '1d7a261e-5e86-4037-b28a-8b7d7e583c8f';"
echo ""
echo "  2. RAILWAY — Update ALLOWED_ORIGINS env var to:"
echo "     https://512ai.co,https://www.512ai.co,https://bighatlawn.com,https://www.bighatlawn.com"
echo ""
echo "  3. RAILWAY — Fix CORS in src/index.js (see CORS_FIX_backend_index_js.js)"
echo ""
echo "  4. UPDATE ~/.config/512ai/.env with new credentials:"
echo "     BHL_API_KEY=${NEW_API_KEY}"
echo "     ADMIN_PORTAL_PASS=${NEW_ADMIN_PASS}"
echo "     BHL_DEMO_RUDY_PASS=${NEW_RUDY_PASS}"
echo "     BHL_DEMO_ADMIN_PASS=${NEW_DEMO_ADMIN_PASS}"
echo ""
echo "  5. TELL RUDY his new demo password: ${NEW_RUDY_PASS}"
echo ""
echo "  6. SQUARESPACE — Update widget script tag cache bust to ?v=3"
echo ""
