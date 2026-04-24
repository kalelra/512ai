# 512AI — Project State
> Last updated: 2026-04-24 | Session: Divi prompt, voice fix, backend crash/recovery

## Repos
| Repo | Notes |
|------|-------|
| kalelra/512ai | Netlify auto-deploy, frontend + demo files |
| kalelra/512ai-backend | Railway auto-deploy, Express API |
| kalelra/512ai-skills | QA skill + teaching agent |

## Infrastructure — All Live
| Service | Status | Notes |
|---------|--------|-------|
| Railway backend | ✅ Live | Recovered from voice.js syntax crash |
| Supabase | ✅ Healthy | 7 tables, RLS enabled |
| Netlify | ✅ Live | Paid plan |
| Bland.ai | ✅ Live | Real calls, SANDBOX_MODE=false |
| Twilio | ✅ Configured | SMS ready |

## AI Agent Names — CRITICAL
- **Divi** = AI for ALL client sites (Big Hat Lawn + future clients)
- **Zoe** = AI for 512ai.co ONLY

## Big Hat Lawn — Rudy
- Tenant ID: `1d7a261e-5e86-4037-b28a-8b7d7e583c8f`
- API Key: `512ai_713664dd917ee4ee35dfc569e109703f`
- Demo: `512ai.co/files/bighatlawndemo.html`
- Logins: `rudy / BigHatLawn2026!` | `admin / 512AI@Admin2026!`
- Hours: Mon-Fri 8am-5pm | Zips: 78742,78617,78719,78747,78744,78748,78652,78745,78725,78653,78763,78724
- Pricing: starting at $40(≤4k)→$45→$50→$60→$70→$80→$95→$120→$120+

## Divi Prompt — LIVE in Supabase
- ✅ Name Divi, Mon-Fri 8-5, starting prices only, day-only scheduling
- ✅ Add-on disclaimer, cancel/reschedule, recurring, out-of-area capture
- ✅ Privacy: never assume caller identity
- ✅ Voice: separate prompt, no phone refs, transfer to Rudy

## Demo Site
- ✅ Login, chat (dynamic UUID session), voice (real calls, 60s cooldown)
- ✅ Scheduling (clickable slots), CRM, 9/9 system tests
- ✅ No mockCRM, no hardcoded session, no blocklist

## QA Rules
- NEVER call/text/email real people in QA tests
- Run `node --check <file>` before every backend push
- Use phone 5550000000, email test@test.com in tests

## Next Priorities
1. Verify Divi voice prompt after crash recovery
2. LawnPro + Zapier — build 6 Zaps (Ricardo has full access)
3. Twilio SMS — Rudy confirms → client SMS
4. Squarespace widget embed (standalone widget-bighatlawn.js)
5. Cloudflare migration planning
6. Zoe (512ai.co) — apply same prompt improvements as Divi
7. Google Maps lot-size API — Phase 2

## Key Lessons
- `node --check` every JS file before pushing — no exceptions
- Supabase chat_system_prompt overrides code fallback — update DB not code
- CORP header must be cross-origin for browser to read API responses

## SMS Workflow — LIVE (Apr 24)
- Booking create → Rudy gets SMS with confirm link (owner alert only)
- Rudy taps link → confirm page → customer gets SMS
- Idempotent: second tap shows "Already confirmed"
- Endpoint: GET /api/v1/notifications/confirm/:bookingId
- QA rule: customer SMS uses fake phone, Rudy's real number only gets one alert per booking
