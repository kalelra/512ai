// netlify/functions/notifications-bighatlawn.js  (or 512ai backend route)
// 512AI — Big Hat Lawn Notification Engine
// Sends Twilio SMS for: booking confirmations, 24h reminders, day-of reminders
//
// ─── ENV VARS NEEDED ──────────────────────────────────────────────────────────
// TWILIO_ACCOUNT_SID     — from Twilio console
// TWILIO_AUTH_TOKEN      — from Twilio console
// BHL_TWILIO_FROM        — Rudy's Twilio phone number (e.g. +15125550100)
//                          OR the 512ai shared number: +15126472949
// BHL_OWNER_PHONE        — Rudy's cell to receive internal alerts (e.g. +15125550199)
// BHL_OWNER_NAME         — "Rudy"  (used in internal notifications)
// NOTIFICATION_SECRET    — shared secret for webhook auth (any random string)
// ─────────────────────────────────────────────────────────────────────────────

const Twilio = require('twilio');

// ─── SMS Templates ────────────────────────────────────────────────────────────
const TEMPLATES = {

  // Customer receives this immediately after booking is confirmed by AI chat
  booking_confirmed: (data) =>
`Hi ${data.customerName}! 🌿 Your Big Hat Lawn appointment is confirmed.

📅 ${data.appointmentDate}
⏰ ${data.appointmentTime}
🏡 ${data.address || 'Your address on file'}
🔧 ${data.serviceType || 'Lawn Service'}

Questions? Reply to this message or call ${data.businessPhone || '(512) 748-2626'}.

– Big Hat Lawn 🤠`,

  // Sent ~24 hours before appointment
  reminder_24h: (data) =>
`Hey ${data.customerName}! 👋 Reminder: Big Hat Lawn is coming tomorrow.

📅 ${data.appointmentDate}
⏰ ${data.appointmentTime}
🏡 ${data.address || 'Your address on file'}

Please make sure gates are unlocked and pets are secured. We'll take great care of your lawn!

Need to reschedule? Reply RESCHEDULE or call ${data.businessPhone || '(512) 748-2626'}.`,

  // Sent morning of appointment (~7 AM)
  reminder_day_of: (data) =>
`Good morning ${data.customerName}! 🌤️ Big Hat Lawn is on the way today.

⏰ Estimated arrival: ${data.appointmentTime}
🏡 ${data.address || 'Your address on file'}

Please have gates unlocked. We'll send a quick "We're here!" text when we arrive.

– Big Hat Lawn 🌿`,

  // Crew arrival notification to customer
  crew_arriving: (data) =>
`🚛 Your Big Hat Lawn crew just arrived at ${data.address || 'your property'}! We're getting started now. It should take about ${data.estimatedDuration || '45-60 minutes'}.`,

  // Job complete — to customer
  job_complete: (data) =>
`✅ All done, ${data.customerName}! Your lawn is looking great.

${data.notes ? '📝 Notes: ' + data.notes + '\n\n' : ''}We appreciate your business! Leave us a Google review? 👉 ${data.reviewLink || 'https://g.page/bighatlawn'}

– Big Hat Lawn 🤠`,

  // Internal — alert Rudy about new booking
  owner_new_booking: (data) =>
`📋 New Booking — Big Hat Lawn

👤 ${data.customerName}
📱 ${data.customerPhone}
📅 ${data.appointmentDate} @ ${data.appointmentTime}
📍 ${data.address || 'No address yet'}
🔧 ${data.serviceType || 'General Service'}
💬 Source: ${data.source || 'AI Chat Widget'}

Reply CONFIRM or call customer to verify.`,

  // Internal — Rudy gets 24h heads-up on tomorrow's schedule
  owner_schedule_reminder: (data) =>
`📅 Tomorrow's Schedule — Big Hat Lawn

${data.appointments.map((a, i) =>
  `${i + 1}. ${a.time} — ${a.customerName} @ ${a.address} (${a.serviceType})`
).join('\n')}

Total: ${data.appointments.length} job(s)
Have a great day! 🌿`
};

// ─── Twilio send helper ────────────────────────────────────────────────────────
async function sendSMS(client, to, from, body) {
  try {
    const msg = await client.messages.create({ to, from, body });
    console.log('[BHL SMS] Sent to', to, '— SID:', msg.sid);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error('[BHL SMS] Failed to send to', to, ':', err.message);
    return { success: false, error: err.message };
  }
}

// ─── Main handler ──────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Notification-Secret',
    'Content-Type':                 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };

  // Auth check
  const secret = event.headers['x-notification-secret'] || event.headers['X-Notification-Secret'];
  if (process.env.NOTIFICATION_SECRET && secret !== process.env.NOTIFICATION_SECRET) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { type, data } = body;

    if (!type || !data) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: 'Missing required fields: type, data' })
      };
    }

    // Init Twilio client
    const client = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    const FROM = process.env.BHL_TWILIO_FROM || process.env.TWILIO_PHONE_NUMBER || '+15126472949';
    const OWNER_PHONE = process.env.BHL_OWNER_PHONE; // Rudy's cell

    const results = [];

    switch (type) {

      case 'booking_confirmed': {
        // SMS to customer
        if (data.customerPhone) {
          const tmpl = TEMPLATES.booking_confirmed(data);
          results.push(await sendSMS(client, data.customerPhone, FROM, tmpl));
        }
        // SMS alert to Rudy
        if (OWNER_PHONE) {
          const ownerTmpl = TEMPLATES.owner_new_booking(data);
          results.push(await sendSMS(client, OWNER_PHONE, FROM, ownerTmpl));
        }
        break;
      }

      case 'reminder_24h': {
        if (data.customerPhone) {
          results.push(await sendSMS(client, data.customerPhone, FROM, TEMPLATES.reminder_24h(data)));
        }
        break;
      }

      case 'reminder_day_of': {
        if (data.customerPhone) {
          results.push(await sendSMS(client, data.customerPhone, FROM, TEMPLATES.reminder_day_of(data)));
        }
        break;
      }

      case 'crew_arriving': {
        if (data.customerPhone) {
          results.push(await sendSMS(client, data.customerPhone, FROM, TEMPLATES.crew_arriving(data)));
        }
        break;
      }

      case 'job_complete': {
        if (data.customerPhone) {
          results.push(await sendSMS(client, data.customerPhone, FROM, TEMPLATES.job_complete(data)));
        }
        break;
      }

      case 'owner_schedule_reminder': {
        if (OWNER_PHONE && data.appointments && data.appointments.length) {
          results.push(await sendSMS(client, OWNER_PHONE, FROM, TEMPLATES.owner_schedule_reminder(data)));
        }
        break;
      }

      default:
        return {
          statusCode: 400,
          headers: CORS,
          body: JSON.stringify({ error: `Unknown notification type: ${type}` })
        };
    }

    const allOk = results.every(r => r.success);
    return {
      statusCode: allOk ? 200 : 207,
      headers: CORS,
      body: JSON.stringify({ success: allOk, type, results })
    };

  } catch (err) {
    console.error('[BHL Notifications] Unhandled error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};

// ─── Reminder Scheduler (call this via cron / Netlify scheduled function) ──────
// Trigger from a separate cron-based function or Netlify scheduled functions.
// Example: run every day at 7:00 AM CT
// This is the logic to pull bookings and fire reminders — wire to LawnPro CRM
// when Rudy's API access is available.
exports.scheduleReminders = async (bookings) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const today     = now.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  for (const booking of bookings) {
    const bookingDate = booking.date; // 'YYYY-MM-DD'

    // 24h reminder
    if (bookingDate === tomorrowStr) {
      await exports.handler({
        httpMethod: 'POST',
        headers: { 'x-notification-secret': process.env.NOTIFICATION_SECRET },
        body: JSON.stringify({ type: 'reminder_24h', data: booking })
      });
    }

    // Day-of reminder
    if (bookingDate === today) {
      await exports.handler({
        httpMethod: 'POST',
        headers: { 'x-notification-secret': process.env.NOTIFICATION_SECRET },
        body: JSON.stringify({ type: 'reminder_day_of', data: booking })
      });
    }
  }
};

/*
─── INTEGRATION MAP ────────────────────────────────────────────────────────────

CURRENT (no CRM access yet):
  chat widget detects BOOKING_CONFIRMED tag
  → fires POST to 512ai backend /api/v1/bookings
  → backend calls this function with type: 'booking_confirmed'

FUTURE (after LawnPro CRM access):
  LawnPro webhook (on new job created) → this function
  LawnPro webhook (on job status change) → crew_arriving / job_complete
  Netlify scheduled function (7AM daily) → owner_schedule_reminder + reminders

─── TEST CURL ──────────────────────────────────────────────────────────────────

curl -s -X POST "https://YOURSITE.netlify.app/.netlify/functions/notifications-bighatlawn" \
  -H "Content-Type: application/json" \
  -H "X-Notification-Secret: YOUR_SECRET" \
  -d '{
    "type": "booking_confirmed",
    "data": {
      "customerName": "John",
      "customerPhone": "+15125551234",
      "appointmentDate": "Monday, April 7",
      "appointmentTime": "10:00 AM",
      "address": "1234 Oak Street, Austin TX",
      "serviceType": "Weekly Mowing",
      "businessPhone": "(512) 555-0100"
    }
  }'

*/
