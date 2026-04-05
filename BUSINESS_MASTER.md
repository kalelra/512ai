# 512AI — Business Master Tracker

## 1. Product Pillars
- **AI Voice** — inbound call handling via Bland.ai (answers, qualifies, books)
- **AI Chat** — website widget powered by Claude API
- **AI Scheduling** — slot management, conflict detection, CRM write-back
- **AI Notifications** — SMS + email post-booking via Twilio + SendGrid
- **CRM Integration** — LawnPro (Rudy pilot), extensible adapter pattern

## 2. Client Pipeline
| Client | Status | CRM | Pilot Start |
|--------|--------|-----|-------------|
| Rudy (landscaping) | Active pilot | LawnPro | ASAP |
| Daniel | No response — paused | TBD | TBD |
| Kevin | Partner kickoff pending | TBD | TBD |

## 3. Infrastructure Checklist
- [ ] Railway backend deployed (Node.js, multi-tenant)
- [ ] Supabase project created + RLS policies applied
- [ ] Cloudflare WAF in front of Railway
- [ ] TLS 1.3 enforced
- [ ] Rate limiting middleware live
- [ ] JWT + API key auth working
- [ ] Audit log table + immutable writes
- [ ] Secrets in Railway env vars (never in git)
- [ ] GitHub Actions CI/CD pipeline

## 4. Agent Checklist
- [ ] VoiceAgent (Bland.ai inbound → transcript → booking)
- [ ] ChatAgent (Claude API, tenant-scoped system prompt)
- [ ] SchedulerAgent (availability, conflict, write)
- [ ] NotificationAgent (Twilio SMS + SendGrid email)
- [ ] IntegrationAgent (CRM adapter: LawnPro → Zapier → native)
- [ ] QAAgent (contract tests, regression suite)

## 5. Security Checklist
- [ ] Cloudflare WAF + DDoS protection
- [ ] Rate limiting per tenant + per IP
- [ ] TLS 1.3 on all endpoints
- [ ] CORS allowlist per tenant domain
- [ ] JWT (15-min access / 7-day refresh)
- [ ] API keys hashed (bcrypt) in DB
- [ ] RBAC: superadmin / tenant_admin / agent roles
- [ ] Supabase RLS — tenant isolation enforced at DB level
- [ ] AES-256 at rest (Supabase default)
- [ ] Input validation + sanitization (Zod)
- [ ] SQL injection + XSS prevention
- [ ] PII TTL (configurable per tenant, default 365 days)
- [ ] Deletion-on-request API endpoint
- [ ] Audit logs (immutable, separate table)
- [ ] Secrets management via Railway env vars
- [ ] SECURITY.md in repo
- [ ] Dependency vulnerability scanning (npm audit in CI)

## 6. Compliance Checklist
- [ ] CCPA compliance (CA customers)
- [ ] Privacy policy published on 512ai.co
- [ ] Terms of service published on 512ai.co
- [ ] Data processing addendum (DPA) template for B2B clients
- [ ] PII data map documented

## 7. Website (512ai.co) Checklist
- [ ] Services overview page (what we offer, how it works)
- [ ] Security & compliance trust section
- [ ] SLA summary on site
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Contact / intake form (updated to route to backend)
- [ ] Pricing page (tiers)
- [ ] Case study placeholder (Rudy → anonymized)

## 8. Business Documents Checklist
- [ ] Master Services Agreement (MSA) template
- [ ] Statement of Work (SOW) template — per client
- [ ] SLA document (uptime, response times, support tiers)
- [ ] Data Processing Addendum (DPA)
- [ ] Onboarding checklist (per new client)
- [ ] Offboarding / data deletion checklist

## 9. Intake Form (512ai.co)
- [ ] Form routes to backend API (not Formspree)
- [ ] Fields: business name, owner name, email, phone, CRM used, services needed, preferred contact time
- [ ] Auto-email confirmation to prospect
- [ ] Auto-notify Ricardo (contact@512ai.co) on new submission
- [ ] Lead stored in Supabase `leads` table

## 10. Monetization
| Tier | Price | Included |
|------|-------|----------|
| Starter | $500 setup + $199/mo | 1 channel (voice OR chat), 500 interactions/mo |
| Growth | $1,000 setup + $399/mo | All channels, 2,000 interactions/mo, CRM integration |
| Scale | $2,500 setup + $799/mo | All channels, unlimited, custom CRM, dedicated support |
| Maintenance | 20% of monthly | Ongoing updates, monitoring, QA |

## 11. SLA Commitments
| Metric | Target |
|--------|--------|
| API uptime | 99.5% monthly |
| Voice response time | < 2s to answer |
| Chat response time | < 3s first token |
| Booking confirmation | < 30s end-to-end |
| Notification delivery | < 60s post-booking |
| Support response | < 4 business hours |
| Critical incident response | < 1 hour |

## 12. Open Risks
- LawnPro native API access — needs Rudy to request credentials
- Bland.ai inbound number provisioning — needs account + number purchase
- Twilio SMS compliance — A2P 10DLC registration for business SMS
- CCPA — need privacy policy + consent capture before storing PII
- Rudy contract — needs MSA + SOW signed before going live
