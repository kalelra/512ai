# 512AI — Security & Exposure Audit Report
**Date:** April 24, 2026  
**Scope:** `kalelra/512ai` (frontend), `kalelra/512ai-backend` (backend), live infrastructure  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Auditor:** Claude (AI Systems Auditor)

---

## 🔴 CRITICAL RISKS (Must Fix Immediately)

### CRITICAL-1: API Key & Tenant ID Exposed in 4+ Public Files

**What:** The Big Hat Lawn API key (`512ai_713664dd...`) and tenant UUID are hardcoded in plaintext in **publicly accessible files**:

| File | URL | Exposed Data |
|------|-----|-------------|
| `widget-bighatlawn.js` | `https://512ai.co/widget-bighatlawn.js` | API key, tenant ID, backend URL |
| `bighatlawndemo.html` | `https://512ai.co/files/bighatlawndemo.html` | API key, tenant ID, backend URL |
| `voice-bighatlawn.js` | `https://512ai.co/files/voice-bighatlawn.js` | API key, tenant ID |
| `STATE.md` | `https://512ai.co/STATE.md` | API key, tenant ID, **demo passwords** |

**Why it's dangerous:** Anyone can use this API key to:
- Send unlimited chat messages (burns your Anthropic credits)
- Initiate voice calls via the backend (burns Bland.ai credits)
- Create fake bookings in Supabase
- Trigger SMS to Rudy (via booking notification flow)
- Query booking availability and CRM data

**The backend CORS is wide open** — confirmed: `Access-Control-Allow-Origin: https://evil-attacker.com` is accepted. Any website can call your backend with the exposed key.

**How to fix:**
1. **Rotate the API key immediately** — generate a new one in Supabase, update tenant row, update all widget/demo files
2. **Fix backend CORS** — the `ALLOWED_ORIGINS` env var exists but the middleware reflects any origin. Restrict to `512ai.co`, `bighatlawn.com`, `localhost` only
3. **Move widget API keys to a token exchange pattern** — widget calls a Netlify function (no key exposed), function calls backend with key server-side
4. **Remove STATE.md from the repo root** or add it to a `_redirects` deny list — it's being served publicly by Netlify

---

### CRITICAL-2: STATE.md Publicly Served — Complete System Blueprint

**What:** `https://512ai.co/STATE.md` is accessible to anyone and contains:
- API key and tenant ID (plaintext)
- Demo login credentials (`rudy/BigHatLawn2026!` and `admin/512AI@Admin2026!`)
- Backend URL (`512ai-backend-production.up.railway.app`)
- Full infrastructure inventory (Railway, Supabase, Netlify, Bland.ai, Twilio)
- Business priorities, client details, pricing tiers
- Repo names (`kalelra/512ai`, `kalelra/512ai-backend`, `kalelra/512ai-skills`)

**Why it's dangerous:** This is a single-file reconnaissance goldmine. An attacker reading this knows your entire stack, your live credentials, your client's name and business, and exactly which systems to target.

**How to fix:**
1. Add to Netlify `_redirects`: `STATE.md  /404  404`
2. Or move STATE.md to a non-deployed location (e.g. a separate private repo, or a Supabase table)
3. Never commit credentials to files served by Netlify — Netlify deploys everything in the repo

---

### CRITICAL-3: Admin Portal Password Exposed in Code Comment

**What:** In `admin-portal.html`, the `ADMIN_USERS` config includes the password as a code comment:
```
hash: 'b09e90c0da55f11aa3e7b54fc6d47037e067e98ead22340c36898120fd1fba43', // 512Admin!2026
```

The hash AND the plaintext password are both visible in the source code served at `https://512ai.co/files/admin-portal.html`.

**Why it's dangerous:** Any visitor can view source, see the password `512Admin!2026`, and log in. The SHA-256 hash is also trivially reversible since the password is right there.

**How to fix:**
1. Remove the comment with the plaintext password immediately
2. Change the password to something not documented in the source
3. Consider moving admin auth to the backend (JWT-based) instead of client-side hash comparison

---

### CRITICAL-4: Demo Page Displays Login Credentials in HTML

**What:** In `bighatlawndemo.html`, the "Admin" tab literally renders the credentials in a table:
```html
'<tr><td>Client</td><td>rudy</td><td>BigHatLawn2026!</td></tr>'
'<tr><td>Admin</td><td>admin</td><td>512AI@Admin2026!</td></tr>'
```

This is visible to anyone who opens the page (no auth required to see the admin tab content in source).

**Why it's dangerous:** Combined with CRITICAL-1, an attacker has full access to the demo site, the API, and can trigger real voice calls and bookings.

**How to fix:**
1. Remove credentials from the HTML source
2. If credentials must be shown for onboarding, gate them behind the admin login (only render after successful auth)
3. Deliver credentials through a secure channel (e.g., encrypted email to Rudy), not in the HTML

---

### CRITICAL-5: Backend CORS Allows Any Origin

**What:** Confirmed via test:
```
curl -H "Origin: https://evil-attacker.com" → access-control-allow-origin: https://evil-attacker.com
```

The backend reflects whatever origin is sent, defeating the purpose of CORS entirely.

**Why it's dangerous:** Combined with the exposed API key, any website on the internet can make authenticated API calls to your backend. A malicious site could embed a script that drains your Anthropic, Bland.ai, and Twilio credits.

**How to fix:**
1. In `src/index.js`, change CORS config from reflection to a strict allowlist
2. Verify the `ALLOWED_ORIGINS` env var is actually being used (the code may be ignoring it)
3. Test CORS with `curl` after the fix to confirm

---

## 🟠 MODERATE RISKS (Should Fix)

### MOD-1: All Client-Specific JS Files Publicly Accessible

**What:** The entire `/files/` directory is served by Netlify with no auth:
- `files/voice-bighatlawn.js` — voice agent config, full Bland.ai integration pattern
- `files/notifications-bighatlawn.js` — Twilio SMS integration, notification templates, webhook auth pattern
- `files/lawnpro-webhook-bighatlawn.js` — CRM webhook handler, HMAC validation logic, full webhook schema
- `files/scheduling-engine.js` — zone routing algorithm, Google Calendar integration, zone-to-zipcode mapping
- `files/scheduling-demo-widget.html` — scheduling UI
- `files/client-portal-bighatlawn.html` — client portal with password hashes

**Why it's dangerous:** A competitor or copycat can read your complete business logic: how you route calls, how you schedule by zone, how you integrate with LawnPro, your notification templates, your webhook validation patterns. This is the core IP of 512AI.

**How to fix:**
1. Server-side JS files (webhook handlers, scheduling engine) should NOT be in the frontend repo — they're backend code
2. Move to the `512ai-backend` repo or at minimum add Netlify `_redirects` rules to block direct access
3. For widget JS that must be public, accept that the code is visible but ensure no secrets are embedded

---

### MOD-2: Netlify Function Source Code Publicly Readable

**What:** The Netlify function source files are served as static JS at their filesystem paths:
- `https://512ai.co/netlify/functions/voice-demo.js` — full voice demo implementation including Bland.ai prompt engineering
- `https://512ai.co/netlify/functions/claude-proxy.js` — Claude API proxy implementation

**Why it's dangerous:** The voice-demo function reveals:
- The complete AI voice script and prompt engineering for every business type (17 types)
- The Bland.ai API payload structure and call configuration
- Voice model settings (`enhanced`, `nat` voice, max duration)

This is your sales demo "secret sauce" — a competitor can copy your voice demo exactly.

**How to fix:**
1. Add `_redirects` rules to block access to `/netlify/functions/*.js` source files
2. Note: The compiled functions at `/.netlify/functions/voice-demo` are the actual endpoints — the source at `/netlify/functions/` should never be served

---

### MOD-3: Client Portal Password Hashes Exposed (Weak Auth)

**What:** All portal files use client-side SHA-256 auth with hashes in the HTML source:
- `portal.html`: `rudy` hash `0c66c91714...`, `admin` hash `1756e48aff...`
- `bighatlawndemo.html`: `rudy` hash `29e4ef938e...`  
- `admin-portal.html`: `diskat` hash `b09e90c0da...` (with plaintext password in comment)

**Why it's dangerous:** 
- SHA-256 hashes with no salt are trivially crackable — these passwords can be reversed with hashcat/rainbow tables in minutes
- Client-side auth provides zero real security — bypassed by disabling JS or reading the source
- If someone has the hash, they have the password

**How to fix:**
1. Short-term: Remove all plaintext password comments, use stronger passwords
2. Medium-term: Move all portal auth to the backend JWT system (which already exists and works)
3. The backend already has `/api/v1/auth/login` with proper JWT — use it for portals

---

### MOD-4: Public Leads Endpoint Has No Rate Limiting Protection

**What:** The `POST /api/v1/leads` endpoint accepts submissions with no auth and no effective rate limiting. In testing, 5 rapid-fire requests all returned `201`.

**Why it's dangerous:** An attacker can:
- Flood the leads table with thousands of junk entries
- Fill Ricardo's inbox with fake lead notifications
- Potentially cause Supabase to hit row limits on the free tier
- Use it for email/phone spam validation (probe valid addresses)

**How to fix:**
1. Add aggressive IP-based rate limiting on the leads endpoint (e.g., 3 per minute per IP)
2. Add CAPTCHA or a honeypot field on the frontend form
3. Add input validation (email format, phone format, business name length limits)

---

### MOD-5: Deep Health Endpoint Reveals Infrastructure Details

**What:** `https://512ai-backend-production.up.railway.app/health/deep` is public (no auth) and reveals:
```json
{"status":"degraded","checks":{"supabase":"ok","anthropic":"ok","twilio":"configured",
"sendgrid":"configured","bland_ai":"configured","sandbox_mode":"off","lawnpro_mock":"pending_real_api"}}
```

**Why it's dangerous:** An attacker now knows:
- Exactly which services you use (Supabase, Anthropic, Twilio, SendGrid, Bland.ai)
- That sandbox mode is off (real calls/messages will go out)
- That LawnPro integration isn't fully active
- If a service goes down, they can see it immediately and time attacks

**How to fix:**
1. Add auth requirement on `/health/deep` (API key or JWT)
2. Keep basic `/health` public (just `{"status":"ok"}`) for uptime monitoring
3. Strip service names from public responses

---

### MOD-6: Voice Demo Has No Abuse Protection

**What:** The `/.netlify/functions/voice-demo` endpoint initiates real Bland.ai calls. While CORS is now restricted to `512ai.co`, there's no rate limiting, CAPTCHA, or call count cap per phone number.

**Why it's dangerous:**
- A determined attacker can bypass CORS by calling the function directly (CORS is browser-enforced, not server-enforced)
- Someone could trigger hundreds of calls to drain Bland.ai credits
- Could be used to harass a phone number with repeated AI calls

**How to fix:**
1. Add server-side rate limiting (e.g., 1 call per phone number per 24 hours)
2. Add per-IP rate limiting (max 3 calls per hour)
3. Block obvious test/invalid numbers
4. Consider adding a simple challenge (reCAPTCHA v3) before allowing calls

---

## 🟡 LOW RISKS / OBSERVATIONS

### LOW-1: CLAUDE.md Publicly Accessible
`https://512ai.co/CLAUDE.md` reveals repo name and backend URL. Low risk since this info is available elsewhere, but it's unnecessary exposure. Add to `_redirects` deny list.

### LOW-2: Editor Page Accessible
`https://512ai.co/editor/index.html` is accessible. It's designed for localhost:3512 and won't function without the local server, but it exposes internal tooling information.

### LOW-3: Netlify Deploy Subdomain Exposed
The `voice-demo.js` CORS allowlist includes `adorable-cucurucho-155e93.netlify.app`, revealing the Netlify deploy preview subdomain.

### LOW-4: Ricardo's Personal Info Broadly Visible
Full name, LinkedIn, Instagram handle (`kalelra`), email (`contact@512ai.co`), Calendly link, headshot, and personal backstory are on the public marketing site. This is intentional for sales but provides social engineering vectors.

### LOW-5: Rudy's Personal Phone Number in Multiple Files
`(512) 748-2626` appears in the demo page, widget, and voice config. This is a business number (expected to be public), but it's also the voice transfer target — if someone exploits the voice system, calls get routed to Rudy.

### LOW-6: GitHub Username Discovery
The GitHub username `kalelra` is exposed via CLAUDE.md, STATE.md, and admin portal file inventory. While repos are private, this enables targeted phishing or credential stuffing attacks.

### LOW-7: Pricing Strategy Fully Exposed
STATE.md contains the complete pricing ladder: `$40→$45→$50→$60→$70→$80→$95→$120→custom`. A competitor can use this to undercut precisely.

### LOW-8: Texas SaaS Tax Info in Architecture Docs
Architecture plan mentions 8.25% tax rate and 20% exemption. Minor, but combined with other data, reveals financial strategy.

---

## 🟢 SAFE AREAS

### SAFE-1: API Keys in Environment Variables (Backend)
Backend secrets (Anthropic, Bland.ai, Twilio, SendGrid, Supabase) are properly stored as Railway environment variables, not hardcoded in backend source code. The Netlify functions also use `process.env` correctly.

### SAFE-2: Claude-Proxy Function Is Well-Built
- CORS restricted to `512ai.co`
- Input sanitized (10KB body limit, system prompt capped at 2000 chars)
- Model locked server-side (can't be overridden by frontend)
- Token count locked at 300

### SAFE-3: Private GitHub Repos
Both `kalelra/512ai` and `kalelra/512ai-backend` are private repos. A public search for `kalelra/512ai` returns no results.

### SAFE-4: Voice-Demo CORS Has Been Fixed
The `voice-demo.js` now properly restricts CORS to an allowlist. The original `*` issue identified in the architecture docs has been resolved.

### SAFE-5: Backend Auth Architecture
The dual API-key + JWT auth model is sound. API key hashing with bcrypt, JWT verification, and role-based access control are correctly implemented.

### SAFE-6: Supabase RLS
Row-Level Security is enabled on all tables with tenant_id scoping. This is the right pattern for multi-tenancy.

### SAFE-7: Audit Logging Exists
The `audit_logs` table and `auditLogger` middleware capture API requests. This provides forensic capability if a breach occurs.

---

## 🧠 ATTACKER PERSPECTIVE SUMMARY

**If I were trying to clone 512AI, how far could I get with what's publicly accessible?**

**Answer: I could clone approximately 80% of the product in a weekend.**

Here's what I can learn from public sources alone (no hacking required):

1. **Full architecture** — STATE.md + CLAUDE.md reveal: repos, services, stack (Express/Supabase/Railway/Netlify), all table names, agent naming convention

2. **Complete business logic** — publicly served JS files contain:
   - Voice agent prompt engineering for 17 business types
   - Zone-based scheduling algorithm with Austin zipcode mapping
   - CRM webhook integration pattern (LawnPro via Zapier)
   - Notification system architecture (Twilio SMS, SendGrid email)
   - Booking flow (availability → booking → CRM sync → notification)

3. **AI "secret sauce"** — the Claude proxy system prompt pattern, the Bland.ai voice script for every business type, and the Divi chat system prompt are all readable

4. **Working credentials** — the API key lets me interact with the live system to study exact AI responses, booking flows, and availability logic

5. **Client information** — Rudy Cantu, Big Hat Lawn, phone number, pricing, business hours, service zones, demo credentials

**What I CAN'T get:**
- Backend source code (private repo)
- Database credentials
- Anthropic/Twilio/Bland API keys (properly in env vars)
- Actual customer data (RLS protects this)

**Bottom line:** The product's implementation patterns, prompts, and business logic are essentially open-source. The competitive moat is execution speed and client relationships, not proprietary technology — because the technology is readable.

---

## 🔧 RECOMMENDED ACTIONS

### Priority 1 — Do Today (< 1 hour)

| # | Action | Time |
|---|--------|------|
| 1 | **Rotate the BHL API key** — new key in Supabase tenants table, update all files | 15 min |
| 2 | **Remove password from admin-portal.html comment** | 2 min |
| 3 | **Add `_redirects` to block sensitive files**: STATE.md, CLAUDE.md, `/files/*.js`, `/netlify/functions/*.js`, `/editor/` | 10 min |
| 4 | **Remove credentials from bighatlawndemo.html** admin tab HTML source | 5 min |
| 5 | **Fix backend CORS** — verify `ALLOWED_ORIGINS` is actually enforced, not reflected | 15 min |

Example `_redirects` file for Netlify:
```
/STATE.md              /404  404
/CLAUDE.md             /404  404
/netlify/functions/*   /404  404
/files/*.js            /404  404!
/editor/*              /404  404
```

### Priority 2 — This Week (< 4 hours)

| # | Action | Time |
|---|--------|------|
| 6 | **Move server-side JS to backend repo** — `scheduling-engine.js`, `notifications-bighatlawn.js`, `lawnpro-webhook-bighatlawn.js` should NOT be in the frontend repo | 2 hrs |
| 7 | **Add rate limiting to `/api/v1/leads`** — 3/min per IP | 30 min |
| 8 | **Require auth on `/health/deep`** — keep `/health` public | 15 min |
| 9 | **Add rate limiting to voice-demo function** — 1 call per phone per 24h | 1 hr |
| 10 | **Remove credentials from STATE.md** — reference "see secure vault" instead | 5 min |

### Priority 3 — This Month

| # | Action | Time |
|---|--------|------|
| 11 | **Implement token exchange for widget** — widget calls Netlify function (no key), function calls backend with key server-side | 4 hrs |
| 12 | **Move portal auth to backend JWT** — replace client-side SHA-256 with real auth | 4 hrs |
| 13 | **Set up a secrets manager** — stop putting credentials in markdown files and HTML comments | 2 hrs |
| 14 | **Add CAPTCHA to public-facing forms** — leads endpoint and voice demo | 2 hrs |
| 15 | **Audit all git history** — check if API keys or passwords were ever committed to git (they'll still be in history even if removed from HEAD) | 1 hr |

---

## Appendix: Files Scanned

| Source | Access | Sensitive Content Found |
|--------|--------|------------------------|
| `https://512ai.co` (index.html) | Public | Formspree endpoint, backend URL, Claude proxy pattern |
| `https://512ai.co/STATE.md` | Public | API key, tenant ID, passwords, full infrastructure map |
| `https://512ai.co/CLAUDE.md` | Public | Repo name, backend URL |
| `https://512ai.co/files/bighatlawndemo.html` | Public | API key, tenant ID, login creds in HTML source |
| `https://512ai.co/files/admin-portal.html` | Public | Password hash + plaintext, env var names, infra details |
| `https://512ai.co/files/portal.html` | Public | Password hashes, client config |
| `https://512ai.co/files/client-portal-bighatlawn.html` | Public | Password hashes |
| `https://512ai.co/widget-bighatlawn.js` | Public | API key, tenant ID, backend URL |
| `https://512ai.co/files/voice-bighatlawn.js` | Public | API key, tenant ID |
| `https://512ai.co/files/notifications-bighatlawn.js` | Public | Twilio integration pattern, webhook auth |
| `https://512ai.co/files/lawnpro-webhook-bighatlawn.js` | Public | CRM webhook schema, HMAC validation |
| `https://512ai.co/files/scheduling-engine.js` | Public | Zone routing, Google Calendar integration |
| `https://512ai.co/netlify/functions/voice-demo.js` | Public | Full voice AI prompt for 17 business types |
| `https://512ai.co/netlify/functions/claude-proxy.js` | Public | Claude API proxy implementation |
| `https://512ai.co/editor/index.html` | Public | Admin editor UI (non-functional without local server) |
| Backend `/health` | Public | Service name |
| Backend `/health/deep` | Public | All service statuses, sandbox mode |
| Backend CORS test | Any origin | Reflects all origins (no restriction) |
| Backend `/api/v1/leads` | Public, no rate limit | Accepts unlimited submissions |

---

*End of Security Audit Report*
