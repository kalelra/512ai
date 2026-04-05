// netlify/functions/lawnpro-webhook-bighatlawn.js
// 512AI — LawnPro CRM Webhook Handler for Big Hat Lawn
//
// LawnPro fires webhooks when jobs are created, updated, or completed.
// This function receives those events and:
//   1. Fires the 512ai notification engine (SMS to customer + Rudy)
//   2. Logs the event for the client dashboard
//   3. Triggers the right AI action based on event type
//
// ─── SETUP IN LAWNPRO ──────────────────────────────────────────────────────
// LawnPro Admin → Settings → Integrations → Webhooks → Add Webhook
// URL: https://512ai.co/.netlify/functions/lawnpro-webhook-bighatlawn
// Events to subscribe: job.created, job.updated, job.completed, job.cancelled
// Secret: set LAWNPRO_WEBHOOK_SECRET env var (copy from LawnPro webhook config)
//
// ─── ENV VARS NEEDED (Railway + Netlify) ───────────────────────────────────
// LAWNPRO_WEBHOOK_SECRET   — from LawnPro webhook config (signature validation)
// NOTIFICATION_ENDPOINT    — https://512ai-backend-production.up.railway.app/api/v1/notify
// NOTIFICATION_SECRET      — shared secret for 512ai notification API
// BHL_OWNER_PHONE          — Rudy's cell (for owner alerts)
// BHL_BUSINESS_PHONE       — Customer-facing phone (shown in SMS)
// BHL_GOOGLE_REVIEW_LINK   — https://g.page/bighatlawn (or GBP review URL)
// ─────────────────────────────────────────────────────────────────────────

const crypto = require('crypto');

exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-LawnPro-Signature',
    'Content-Type':                 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };

  // ─── Signature Verification ─────────────────────────────────────────────
  // LawnPro signs webhooks with HMAC-SHA256. Validate before processing.
  const signature = event.headers['x-lawnpro-signature'] || event.headers['X-LawnPro-Signature'];
  const secret = process.env.LAWNPRO_WEBHOOK_SECRET;

  if (secret && signature) {
    const expectedSig = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(event.body)
      .digest('hex');

    if (signature !== expectedSig) {
      console.error('[LawnPro Webhook] Invalid signature — possible spoofed request');
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Invalid signature' }) };
    }
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { event: eventType, data: job } = payload;

    console.log(`[LawnPro Webhook] Event: ${eventType} | Job: ${job?.id}`);

    // ─── Normalize job data from LawnPro format ──────────────────────────
    // LawnPro field names may vary — update these mappings once you have
    // access to the actual LawnPro API docs / webhook sample payloads
    const normalized = {
      // Customer info
      customerName:    job?.customer?.first_name || job?.client_name || 'Customer',
      customerPhone:   job?.customer?.phone       || job?.client_phone,
      customerEmail:   job?.customer?.email       || job?.client_email,

      // Job info
      jobId:           job?.id || job?.job_id,
      serviceType:     job?.service_type || job?.job_type || 'Lawn Service',
      appointmentDate: formatDate(job?.scheduled_date || job?.date),
      appointmentTime: formatTime(job?.scheduled_time || job?.start_time),
      address:         formatAddress(job?.property || job?.address),
      notes:           job?.notes || job?.description,

      // Business info (from env vars — filled once Rudy provides)
      businessPhone:   process.env.BHL_BUSINESS_PHONE || '(512) 555-0100',
      reviewLink:      process.env.BHL_GOOGLE_REVIEW_LINK || 'https://bighatlawn.com'
    };

    // ─── Route by event type ─────────────────────────────────────────────
    switch (eventType) {

      case 'job.created':
        // New job booked → SMS confirmation to customer + alert to Rudy
        await fireNotification('booking_confirmed', {
          ...normalized,
          source: 'LawnPro CRM'
        });
        console.log(`[LawnPro] New job created → SMS confirmation sent to ${normalized.customerPhone}`);
        break;

      case 'job.updated':
        // Job rescheduled → let customer know
        if (job?.rescheduled || job?.status === 'rescheduled') {
          await fireNotification('booking_confirmed', {
            ...normalized,
            customerName: normalized.customerName + ' (Updated Schedule)'
          });
        }
        // Job status: crew dispatched / en route
        if (job?.status === 'en_route' || job?.status === 'dispatched') {
          await fireNotification('crew_arriving', normalized);
        }
        break;

      case 'job.crew_arriving':
      case 'job.started':
        // Crew marked as on-site → notify customer
        await fireNotification('crew_arriving', {
          ...normalized,
          estimatedDuration: job?.estimated_duration || '45-60 minutes'
        });
        break;

      case 'job.completed':
        // Job done → review request + internal log
        await fireNotification('job_complete', {
          ...normalized,
          notes: job?.completion_notes || job?.notes
        });
        console.log(`[LawnPro] Job completed → review request SMS sent to ${normalized.customerPhone}`);
        break;

      case 'job.cancelled':
        // Job cancelled — log it, no SMS for now (add template later)
        console.log(`[LawnPro] Job cancelled: ${normalized.jobId} for ${normalized.customerName}`);
        // TODO: Add cancellation SMS template to notifications engine
        break;

      default:
        console.log(`[LawnPro] Unhandled event type: ${eventType}`);
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ received: true, event: eventType, jobId: normalized.jobId })
    };

  } catch (err) {
    console.error('[LawnPro Webhook] Error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'Webhook processing failed' })
    };
  }
};

// ─── Fire 512AI Notification ────────────────────────────────────────────────
async function fireNotification(type, data) {
  const endpoint = process.env.NOTIFICATION_ENDPOINT ||
    'https://512ai-backend-production.up.railway.app/api/v1/notify';

  const res = await fetch(endpoint, {
    method:  'POST',
    headers: {
      'Content-Type':           'application/json',
      'X-Notification-Secret':  process.env.NOTIFICATION_SECRET || ''
    },
    body: JSON.stringify({ type, data })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[LawnPro] Notification failed (${type}):`, err);
    throw new Error(`Notification API returned ${res.status}`);
  }

  return res.json();
}

// ─── Format Helpers ─────────────────────────────────────────────────────────
// These normalize LawnPro date/time/address formats to readable strings.
// Update once you see actual LawnPro payload structure.

function formatDate(raw) {
  if (!raw) return 'TBD';
  try {
    return new Date(raw).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });
  } catch { return String(raw); }
}

function formatTime(raw) {
  if (!raw) return 'TBD';
  // Handle "14:00", "2:00 PM", or ISO timestamp
  try {
    if (raw.includes(':')) {
      const [h, m] = raw.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
    }
    return new Date(raw).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch { return String(raw); }
}

function formatAddress(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  // LawnPro might send address as object
  const { street, city, state, zip } = raw;
  return [street, city, state, zip].filter(Boolean).join(', ');
}

/*
─── REMINDER SCHEDULER (Cron) ─────────────────────────────────────────────────
Create a separate Netlify Scheduled Function to fire daily reminders:

File: netlify/functions/scheduled-reminders-bighatlawn.js

exports.handler = schedule("0 13 * * *", async () => {
  // 7 AM CT = 13:00 UTC
  // Pull today's and tomorrow's jobs from LawnPro API
  // POST reminder_24h and reminder_day_of to notification endpoint
  // Wires up once we have LawnPro API key
});

─── LAWNPRO API ENDPOINTS (to fetch jobs for reminder scheduler) ───────────────
Base URL:    https://api.lawnpro.com/v2  (verify with LawnPro docs)
Auth:        Bearer token from LawnPro Settings → API Access
Jobs list:   GET /jobs?scheduled_date=YYYY-MM-DD&status=scheduled
Job detail:  GET /jobs/{id}

─── TEST CURL ──────────────────────────────────────────────────────────────────
curl -s -X POST "https://512ai.co/.netlify/functions/lawnpro-webhook-bighatlawn" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "job.created",
    "data": {
      "id": "job_12345",
      "customer": { "first_name": "John", "phone": "+15125551234" },
      "service_type": "Weekly Mowing",
      "scheduled_date": "2026-04-07",
      "scheduled_time": "10:00",
      "property": { "street": "1234 Oak St", "city": "Austin", "state": "TX", "zip": "78701" }
    }
  }'
*/
