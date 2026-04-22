# 512AI — Project State
> Last updated: 2026-04-22 | Session: infrastructure audit + fixes

## Repos
| Repo | Visibility | Updated |
|------|-----------|---------|
| kalelra/512ai | public | Apr 11 |
| kalelra/512ai-backend | private | Apr 22 |
| kalelra/512ai-skills | public | Apr 10 |

## Infrastructure — Confirmed Live
| Service | Status | Evidence |
|---------|--------|----------|
| Railway backend | ✅ Live | /health returns ok, Node 20, auto-deploys from main |
| Supabase | ✅ Healthy | /health/deep returns ok, 7 tables, RLS enabled |
| Netlify frontend | ✅ Live | 512ai.co auto-deploys from kalelra/512ai main |
| Anthropic API | ⛔ BLOCKED | Billing bug — $24.97 balance but API returns "credits too low". Support ticket open. |

## Blocked: Anthropic API Billing Bug
- Ticket open with Anthropic support as of Apr 22
- request-id: req_011CaJBQLp19y126YrD2yTJj
- org-id: 07e421f7-ec83-4297-a593-0b03eadd0d87
- Last working: Apr 20. All models affected. /v1/models works, /v1/messages fails.
- Impact: Chat and voice broken on demo site for Rudy
- When resolved, test with: source ~/.config/512ai/.env && curl -s "$RAILWAY_BACKEND_URL/api/v1/chat" -H "X-API-Key: $BHL_API_KEY" -H "Content-Type: application/json" -d "{\"tenantId\":\"1d7a261e-5e86-4037-b28a-8b7d7e583c8f\",\"sessionId\":\"$(uuidgen | tr '[:upper:]' '[:lower:]')\",\"message\":\"hello\"}"

## Changes Made Today (Apr 22)
- Health check: now uses /v1/models instead of sending a real message
- Node.js: upgraded to 20 on Railway (.node-version, .nvmrc, package.json engines)
- Model string: reverted to claude-sonnet-4-20250514
- Error handler: added Anthropic error detail, then reverted for production
- CLAUDE.md: slimmed ~40% in both repos

## Clients
| Client | Status | Notes |
|--------|--------|-------|
| Rudy — Big Hat Lawn | Active | Tenant 1d7a261e..., demo at 512ai.co/bighatlawndemo |
| Daniel | Paused | No response |
| Kevin | Pending | Partner kickoff not done |

## Credentials
- Source of truth: ~/.config/512ai/.env on MacBook
- Railway: 19 env vars, ANTHROPIC_API_KEY matches local
- Netlify: ANTHROPIC_API_KEY, BLAND_API_KEY, TWILIO_PHONE_NUMBER
- GitHub PAT: in ~/.config/512ai/.env

## Next Priorities (after Anthropic fix)
1. Push this STATE.md to kalelra/512ai repo
2. Wire intake form to POST to /api/v1/leads
3. Fix CORS on netlify/functions/voice-demo.js
4. Migrate ZOE_CONFIG to tenant config
5. LawnPro API — waiting on Rudy credentials
6. LLC formation — file Form 205 ($308)

## Context Rules
- This project chat: planning, architecture, STATE.md
- New chat per build feature
- NEVER use /compact
- Push STATE.md after each major session
