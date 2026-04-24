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
