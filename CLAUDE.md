# 512AI — Claude Code Standing Instructions

> This file is read automatically at the start of every Claude Code session.
> It contains everything Claude needs to work on this project without Ricardo
> having to re-explain context, preferences, or the tech stack.

---

## Who I'm working with

**Ricardo Avila** — Senior Technical Program Manager, 20+ years experience.
- GitHub: `kalelra`
- Primary machine: MacBook Pro (`~/Claude_Projects/512ai`)
- Secondary machine: Mac Mini SSH at `192.168.5.133` (`~/Claude-Projects/512ai`)
- Business email: `contact@512ai.co`
- Personal email: `avilaricardoe@gmail.com`
- LinkedIn: `linkedin.com/in/avilaricardoe`

**How Ricardo works:**
- Skip all yes/no confirmations — assume approval on everything
- Always use Shift+Tab (allow all edits) mode
- Challenge decisions proactively — if there's a better approach, say so
- Catch bugs and edge cases before he hits them
- No hand-holding on basics — he's a senior TPM
- Production-ready code only, never prototypes
- When something breaks, diagnose and fix it without being asked

---

## Directory map

| What | MacBook Path | GitHub Repo | Deploy |
|------|-------------|-------------|--------|
| 512AI Frontend | `~/Claude_Projects/512ai/` | `kalelra/512ai` | Netlify (auto on push) |
| 512AI Backend | `~/Claude_Projects/512ai-backend/` | `kalelra/512ai-backend` | Railway (auto on push) |
| Business docs | `~/Claude_Projects/512ai-backend/docs/` | `kalelra/512ai-backend/docs/` | — |

### Patch workflow (Claude.ai → GitHub)
When updates arrive as a `.patch` file from Claude.ai:
```bash
cd ~/Downloads && bash apply-updates.sh
```
Script lives at `~/Downloads/apply-updates.sh` — clones/pulls backend to `~/Claude_Projects/512ai-backend`, applies patch, pushes.

---

## Project: 512AI Website

**Live site:** https://512ai.co
**Netlify deploy:** https://adorable-cucurucho-155e93.netlify.app
**GitHub repo:** https://github.com/kalelra/512ai
**Branch:** `main` — every push auto-deploys via Netlify

### File structure
```
512ai/
├── index.html              # Entire website — single file, all CSS/JS inline
├── ricardo-headshot.png    # Professional headshot photo (navy blazer)
├── netlify/
│   └── functions/
│       └── claude-proxy.js # Serverless proxy for Anthropic API calls
├── editor/
│   └── index.html          # Local GUI editor for site content updates
├── CLAUDE.md               # This file
└── README.md
```

### Tech stack
- **Frontend:** Vanilla HTML/CSS/JS — no frameworks, no build tools
- **Fonts:** Playfair Display (headlines), DM Sans (body), IBM Plex Mono (code/demo)
- **Colors:** Background `#0F0F0F`, Accent `#C0531A` (burnt orange), Text `#F5F0EA`
- **Hosting:** Netlify (free tier, auto-deploy from GitHub main)
- **API proxy:** Netlify serverless function at `/.netlify/functions/claude-proxy`
- **Contact form:** Formspree `https://formspree.io/f/mojklvjq`
- **Booking:** Calendly `https://calendly.com/avilaricardoe/free-ai-strategy-call`
- **DNS:** Namecheap → Netlify nameservers (dns1-4.p08.nsone.net)

### Environment variables (set in Netlify dashboard)
- `ANTHROPIC_API_KEY` — used by claude-proxy.js only, never in frontend code

---

## Site sections (in order)

1. **Nav** — sticky, transparent → solid on scroll, burnt orange `512AI` wordmark
2. **Hero** — full viewport, headline, two CTAs (demo + Calendly), three trust badges
3. **Services** — three cards, NO PRICING shown (pricing removed by design — discovery call only)
4. **Demo** — live AI widget calling `/.netlify/functions/claude-proxy`
5. **How It Works** — three steps
6. **About / Meet Ricardo** — headshot + bio, credentials, Calendly CTA
7. **Intake Form** — dynamic business intake, 17 categories, submits to Formspree
8. **Contact / Footer** — Calendly + contact form + social links

---

## Key decisions already made (do not revert)

- **No pricing on the site** — removed intentionally. Services section shows package names and features but no dollar amounts. All pricing handled on discovery calls.
- **Single index.html** — do not split into separate CSS/JS files. Keep everything inline for simplicity of deployment.
- **No API key in frontend** — all Claude API calls go through `netlify/functions/claude-proxy.js`. Never add `x-api-key` to browser-facing code.
- **Formspree endpoint** — `https://formspree.io/f/mojklvjq` — do not change.
- **Calendly link** — always `https://calendly.com/avilaricardoe/free-ai-strategy-call`
- **Email** — always `contact@512ai.co` in visible site copy, never the personal Gmail.
- **Headshot** — `ricardo-headshot.png` = navy blazer professional photo. Do not replace.

---

## How to deploy changes

```bash
git add .
git commit -m "description of what changed"
git push
```

Netlify auto-deploys in ~30 seconds. No build command needed.

To verify deployment: https://app.netlify.com → 512ai site → Deploys tab.

---

## When updating index.html

- Preserve the single-file structure
- Keep all Google Fonts `<link>` tags in `<head>`
- Maintain section IDs: `#services`, `#demo`, `#about`, `#intake`, `#contact`
- Keep nav links synchronized with section IDs
- After any content change, verify mobile responsiveness at 768px and 480px breakpoints
- Run `grep -n "TODO\|PLACEHOLDER\|FIXME" index.html` before committing — no placeholders in production

---

## Business context

**512AI** — AI automation agency for Austin, TX small businesses.
Owner: Ricardo Avila (born Monterrey, Mexico — grew up in Austin)
Tagline: "AI tools for Austin businesses. Simple. Local. Affordable."
Target market: Austin small businesses (restaurants, contractors, salons, HVAC, legal, medical, etc.)
Services: AI chatbots, voice assistants, automation workflows, lead capture, review management
Positioning: Local, approachable, affordable — not a corporate agency
Differentiator: Live demo widget on the homepage lets visitors test AI before booking

**Ricardo's other business (Project 2):**
UNO MAS! Salsa — unomassalsa.com — award-winning small-batch salsa brand
Do not mix content between 512AI and UNO MAS! projects.

---

## Maintenance tasks (run monthly)

- `npm audit` — check for dependency vulnerabilities (none currently since vanilla JS)
- Verify Formspree form is still receiving submissions at formspree.io dashboard
- Check Netlify function logs for claude-proxy errors: Netlify → Functions tab
- Confirm Calendly link still resolves correctly
- Review Google Search Console for any crawl errors (once set up)
- Check Anthropic API usage at console.anthropic.com — watch for unexpected cost spikes

---

## Project: 512AI Backend

**GitHub repo:** https://github.com/kalelra/512ai-backend (private)
**Local path:** `~/Claude_Projects/512ai-backend/`
**Deploy:** Railway — auto-deploys on push to `main`
**Health check:** `https://YOUR-RAILWAY-URL/health/deep`

### Tech stack
- Node.js / Express, Railway-hosted
- Supabase (Postgres + RLS) for all data
- JWT + RBAC auth, API keys per tenant
- 6 agents: Voice (Bland.ai), Chat (Anthropic), Scheduler, Notification (Twilio/SendGrid), Integration, QA
- Multi-tenant — one backend serves all 512AI clients

### Key files
- `src/index.js` — Express app entry, all middleware wired
- `src/routes/` — auth, tenants, bookings, voice, chat, leads, health
- `src/agents/index.js` — all 6 agent handlers
- `supabase/migrations/001_initial_schema.sql` — full DB schema with RLS
- `.env.example` — all required env vars (set in Railway dashboard, never commit `.env`)
- `docs/BUSINESS_MASTER.md` — pricing, SLA, client tracker

### Environment variables (set in Railway dashboard)
- `NODE_ENV`, `JWT_SECRET`, `ALLOWED_ORIGINS`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`, `BLAND_API_KEY`, `BLAND_WEBHOOK_SECRET`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_DEFAULT_FROM`
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`

### Backend maintenance tasks (monthly)
- `npm audit` in `~/Claude_Projects/512ai-backend`
- Check Railway logs for errors: Railway dashboard → Deployments → Logs
- Check Supabase dashboard for slow queries or storage growth
- Verify `/health/deep` still returns `supabase: connected`
- Review Anthropic API usage at console.anthropic.com

---

## Project 2 — UNO MAS! Salsa (queued, not started)

When Ricardo says "start Project 2" or "let's work on UNO MAS!", initialize a new repo:
```bash
mkdir ~/Claude_Projects/unomassalsa
cd ~/Claude_Projects/unomassalsa
gh repo create unomassalsa --private --source=. --remote=origin
```

Key info for that project:
- Current site: Squarespace at unomassalsa.com
- Goal: Automation for sales/events + possible site rebuild
- Products: Code Breaker (mild), Tres Amigos (medium), Lion Tamer (spicy)
- Awards: Tres Amigos 1st place People's Choice, Code Breaker 2nd place — Buda Margarita Salsa Fest 2023
- Family business: Ricardo (founder/production), Mary Rose (marketing/branding), Zoe & Zander (VP of Sales and Film Kids)

---

## Session startup checklist

At the start of every session, Claude Code should silently:
1. Run `git status` to check for uncommitted changes
2. Run `git pull` to ensure local is up to date with remote
3. Remind Ricardo if there are any open TODOs from CLAUDE.md maintenance tasks
4. Never ask "what would you like to work on?" — wait for Ricardo's instruction

---

*Last updated: April 2026 — Ricardo Avila / 512AI*
