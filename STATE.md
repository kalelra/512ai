# 512AI — Project State
> Last updated: 2026-04-24 | Session: Full end-to-end loop complete

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
- Tenant ID: 1d7a261e-5e86-4037-b28a-8b7d7e583c8f
- API Key: 512ai_713664dd917ee4ee35dfc569e109703f
- Demo: 512ai.co/files/bighatlawndemo.html | rudy/BigHatLawn2026! | admin/512AI@Admin2026!
- Hours: Mon-Fri 8-5 | Pricing: $40→$45→$50→$60→$70→$80→$95→$120→custom

## Full Loop — LIVE ✅
Customer chats Divi → info collected → booking auto-created → Rudy SMS alert → Rudy confirms → Customer SMS

## Widget — bighatlawn.com
- URL: https://512ai.co/widget-bighatlawn.js?v=2 (Squarespace Code Injection footer)
- Design: pill shape, bottom-LEFT, Big Hat Lawn hat SVG, bounce animation, touchend mobile fix

## LawnPro + Zapier
- Backend fully built, Zaps drafted, blocked on Rudy's LawnPro API plan
- Rudy calls: (661) 384-7070 to enable Zapier/API access

## QA Rules
- NEVER call/text/email real people in QA tests
- node --check every JS file before pushing
- Netlify CDN: always cache-bust with ?v=N on script tags

## Next Priorities
1. Architecture overhaul — ZOE_CONFIG→tenant config, multi-tenancy (blocks 2nd client)
2. Zoe (512ai.co) — update to same quality as Divi
3. LawnPro Zapier — activate when Rudy gets API plan
4. Google Maps lot-size — Phase 2
5. 2nd client onboarding
