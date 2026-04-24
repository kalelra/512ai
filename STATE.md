# 512AI — Project State
> Last updated: 2026-04-23 | Session: BHL demo QA, Divi naming, platform fixes

## Repos
| Repo | Branch | Notes |
|------|--------|-------|
| kalelra/512ai | main | Netlify auto-deploy, frontend + demo files |
| kalelra/512ai-backend | main | Railway auto-deploy, Express API |
| kalelra/512ai-skills | main | QA skill + teaching agent |

## Infrastructure — All Live
| Service | Status | Notes |
|---------|--------|-------|
| Railway backend | ✅ Live | SANDBOX_MODE=false, real Bland.ai calls |
| Supabase | ✅ Healthy | 7 tables, RLS enabled |
| Netlify | ✅ Live | Upgraded to paid plan |
| Anthropic API | ✅ Working | Chat + voice functional |
| Bland.ai | ✅ Live | Real calls, voicemail configured |
| Twilio | ✅ Configured | SMS notifications ready |

## AI Agent Names — CRITICAL
- **Divi** = AI for CLIENT sites (Big Hat Lawn, all future clients)
- **Zoe** = AI for 512ai.co ONLY (Ricardo's marketing/demo site)

## Big Hat Lawn — Rudy
- Tenant ID: `1d7a261e-5e86-4037-b28a-8b7d7e583c8f`
- API Key: `512ai_713664dd917ee4ee35dfc569e109703f`
- Demo: `512ai.co/files/bighatlawndemo.html`
- Logins: `rudy / BigHatLawn2026!` | `admin / 512AI@Admin2026!`
- Hours: Mon-Fri 8am-5pm | Zips: 78742,78617,78719,78747,78744,78748,78652,78745,78725,78653,78763,78724
- Pricing: $40(≤4k)→$45→$50→$60→$70→$80→$95→$120→$120+custom

## Demo Site — Current State
- ✅ Login, AI Chat (dynamic UUID session), Voice (real calls, 60s cooldown, transcript)
- ✅ Scheduling (clickable slots, preferredDate/preferredTime), CRM, System tests 9/9
- ⚠️ Voice config still says "Zoe" in voice.js ZOE_CONFIG — rename to Divi pending
- ⚠️ Divi system prompt deployed but verify hours/pricing responses are correct

## Integrations
- LawnPro + Zapier: Ricardo has full access + Zapier Pro paid. NOT blocked. Build it.
- Squarespace embed: planned — need standalone widget-bighatlawn.js

## QA Rules — Hard
- NEVER call/text/email real people in QA tests
- Use phone 5550000000, email test@test.com only
- Real comms only when user manually triggers from demo UI

## Next Priorities
1. Rename Zoe→Divi in voice.js + write full Divi prompt (day-only, cancel/reschedule, recurring, add-ons, Rudy-confirms-first SMS)
2. LawnPro Zapier integration — 6 Zaps, Ricardo has access
3. Twilio SMS workflow — Rudy confirms → client SMS
4. Squarespace widget embed (standalone widget-bighatlawn.js)
5. Cloudflare migration planning (Ricardo wants simpler unified stack)
6. Apply Divi prompt improvements to Zoe on 512ai.co

## Context Rules
- Start every chat: search STATE.md + conversation history first
- End every chat: update STATE.md — lean, no duplicates, push to GitHub
- Platform principle: improvements for clients propagate to 512ai.co where relevant
