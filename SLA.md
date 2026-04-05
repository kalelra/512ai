# 512AI — Service Level Agreement (SLA)
**Version 1.0 | Effective April 2026**

---

## 1. Service Commitments

| Metric | Commitment |
|--------|-----------|
| API uptime | 99.5% monthly |
| Voice answer time | < 2 seconds |
| Chat first response | < 3 seconds |
| Booking confirmation (end-to-end) | < 30 seconds |
| Notification delivery (SMS/email) | < 60 seconds post-booking |
| Support response — standard | < 4 business hours |
| Support response — critical incident | < 1 hour |

Business hours: Monday–Friday, 8am–6pm Central Time.

---

## 2. Exclusions

Downtime does not count against SLA if caused by:
- Scheduled maintenance (24hr advance notice)
- Third-party outages (Bland.ai, Twilio, SendGrid, client CRM)
- Client-caused misconfiguration
- Force majeure events

---

## 3. Incident Response

| Severity | Definition | Response |
|----------|-----------|----------|
| P1 — Critical | Service completely down | < 1 hour, Ricardo notified immediately |
| P2 — High | Core feature degraded | < 4 hours |
| P3 — Medium | Non-critical feature issue | < 1 business day |
| P4 — Low | Cosmetic / minor | Next sprint |

---

## 4. Scheduled Maintenance

Maintenance windows: Sundays 2–4am Central. Clients notified 24 hours in advance via email.

---

## 5. Credits

If monthly uptime falls below 99.5%, client receives a service credit:

| Uptime | Credit |
|--------|--------|
| 99.0–99.5% | 10% of monthly fee |
| 98.0–99.0% | 25% of monthly fee |
| < 98.0% | 50% of monthly fee |

Credits applied to next invoice. Not redeemable for cash.

---

## 6. Data & Security

- All customer data encrypted in transit (TLS 1.3) and at rest (AES-256)
- PII retained per client agreement (default: 1 year for bookings, 90 days for chat)
- Data deletion on request within 5 business days
- Audit logs maintained for 2 years
- CCPA compliant

---

## 7. Support Channels

- Email: contact@512ai.co
- Response during business hours only
- Emergency (P1): direct contact provided at onboarding

---

*This SLA is incorporated into the Master Services Agreement. 512AI reserves the right to update this document with 30 days notice.*
