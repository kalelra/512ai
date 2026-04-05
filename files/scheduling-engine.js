// netlify/functions/scheduling-engine.js
// 512AI — Scheduling & Routing Engine
// Checks Google Calendar availability and routes by zipcode/zone

const { google } = require('googleapis');

// Zone definitions — Austin + surrounding areas
const ZONE_MAP = {
  central: {
    name: 'Central Austin',
    crew: 'Crew A',
    zipcodes: ['78701','78702','78703','78704','78705','78751','78752','78753','78754','78755','78756'],
    color: '#C0531A'
  },
  north: {
    name: 'North Austin / Round Rock / Cedar Park',
    crew: 'Crew B',
    zipcodes: ['78613','78628','78681','78750','78757','78758','78759','78727','78728','78729','78730','78731'],
    color: '#2563eb'
  },
  south: {
    name: 'South Austin / Buda / Kyle',
    crew: 'Crew C',
    zipcodes: ['78610','78640','78744','78745','78746','78747','78748','78749','78652'],
    color: '#16a34a'
  },
  east: {
    name: 'East Austin / Pflugerville / Manor',
    crew: 'Crew D',
    zipcodes: ['78653','78660','78661','78721','78722','78723','78724','78725','78741','78742','78743'],
    color: '#9333ea'
  },
  west: {
    name: 'West Austin / Lakeway / Bee Cave',
    crew: 'Crew E',
    zipcodes: ['78669','78732','78733','78734','78735','78736','78737','78738','78739'],
    color: '#d97706'
  }
};

// Business hours: Mon-Sat 7am-6pm CT
const BUSINESS_HOURS = { start: 7, end: 18 };
const APPOINTMENT_DURATION = 120; // 2 hours in minutes
const DAYS_AHEAD = 7; // Look 7 days ahead for availability

function getZoneByZipcode(zipcode) {
  const clean = zipcode.replace(/\D/g, '').substring(0, 5);
  for (const [zoneId, zone] of Object.entries(ZONE_MAP)) {
    if (zone.zipcodes.includes(clean)) {
      return { zoneId, ...zone };
    }
  }
  return null;
}

function generateTimeSlots(date) {
  const slots = [];
  const d = new Date(date);
  for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end - 1; hour++) {
    const start = new Date(d);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + APPOINTMENT_DURATION);
    if (end.getHours() <= BUSINESS_HOURS.end) {
      slots.push({ start: start.toISOString(), end: end.toISOString(), 
        label: `${hour > 12 ? hour-12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'} - ${end.getHours() > 12 ? end.getHours()-12 : end.getHours()}:00 ${end.getHours() >= 12 ? 'PM' : 'AM'}` });
    }
  }
  return slots;
}

async function getCalendarClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  return google.calendar({ version: 'v3', auth });
}

async function getBookedSlots(calendarId, zoneId, startDate, endDate) {
  try {
    const calendar = await getCalendarClient();
    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      q: `zone:${zoneId}`,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return response.data.items || [];
  } catch (err) {
    console.error('Calendar fetch error:', err.message);
    return [];
  }
}

function isSlotAvailable(slot, bookedEvents) {
  const slotStart = new Date(slot.start);
  const slotEnd = new Date(slot.end);
  for (const event of bookedEvents) {
    if (!event.start?.dateTime) continue;
    const eventStart = new Date(event.start.dateTime);
    const eventEnd = new Date(event.end.dateTime);
    if (slotStart < eventEnd && slotEnd > eventStart) return false;
  }
  return true;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method Not Allowed' };

  try {
    const { zipcode, serviceType, action, appointmentData } = JSON.parse(event.body);

    // ACTION: Get availability for a zipcode
    if (action === 'check_availability' || !action) {
      if (!zipcode) return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Zipcode required' }) };

      const zone = getZoneByZipcode(zipcode);
      if (!zone) {
        return { statusCode: 200, headers, body: JSON.stringify({
          success: false,
          error: 'Sorry, that zipcode is outside our current service area. We serve Austin and surrounding areas.',
          serviceArea: Object.values(ZONE_MAP).map(z => z.name)
        })};
      }

      // Get next 7 days of availability
      const today = new Date();
      today.setHours(0,0,0,0);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + DAYS_AHEAD);

      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
      const bookedEvents = await getBookedSlots(calendarId, zone.zoneId, today, endDate);

      const availableSlots = [];
      for (let i = 1; i <= DAYS_AHEAD; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        if (date.getDay() === 0) continue; // Skip Sundays
        const daySlots = generateTimeSlots(date);
        const availableForDay = daySlots.filter(slot => isSlotAvailable(slot, bookedEvents));
        if (availableForDay.length > 0) {
          availableSlots.push({
            date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Chicago' }),
            dateISO: date.toISOString().split('T')[0],
            slots: availableForDay.slice(0, 3) // Show max 3 slots per day
          });
        }
        if (availableSlots.length >= 3) break; // Show 3 available days
      }

      return { statusCode: 200, headers, body: JSON.stringify({
        success: true,
        zone: { id: zone.zoneId, name: zone.name, crew: zone.crew, color: zone.color },
        serviceType: serviceType || 'General Service',
        availableSlots,
        message: `${zone.crew} covers your area (${zone.name})`
      })};
    }

    // ACTION: Book an appointment
    if (action === 'book') {
      const { name, phone, address, zipcode: apptZip, serviceType: apptService, slot } = appointmentData;
      if (!name || !phone || !apptZip || !slot) {
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Missing required booking info' }) };
      }

      const zone = getZoneByZipcode(apptZip);
      if (!zone) return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Invalid zipcode' }) };

      const calendar = await getCalendarClient();
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      const calEvent = await calendar.events.insert({
        calendarId,
        resource: {
          summary: `🔧 ${apptService || 'Sprinkler Service'} — ${name}`,
          description: `Customer: ${name}\nPhone: ${phone}\nAddress: ${address}\nService: ${apptService}\nZone: ${zone.name} (zone:${zone.zoneId})\nCrew: ${zone.crew}\n\nBooked via 512AI scheduling system`,
          start: { dateTime: slot.start, timeZone: 'America/Chicago' },
          end: { dateTime: slot.end, timeZone: 'America/Chicago' },
          colorId: '6',
        },
      });

      // Send SMS confirmation via Twilio
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
          const cleanPhone = phone.replace(/\D/g,'');
          const formattedPhone = cleanPhone.startsWith('1') ? `+${cleanPhone}` : `+1${cleanPhone}`;
          const msgBody = `Hi ${name}! Your sprinkler service appointment is confirmed for ${new Date(slot.start).toLocaleString('en-US', {weekday:'long',month:'long',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/Chicago'})}. ${zone.crew} will be there. Questions? Reply to this text. — 512AI`;
          
          await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ To: formattedPhone, From: process.env.TWILIO_PHONE_NUMBER, Body: msgBody })
          });
        } catch (smsErr) {
          console.error('SMS error (non-fatal):', smsErr.message);
        }
      }

      return { statusCode: 200, headers, body: JSON.stringify({
        success: true,
        confirmationId: calEvent.data.id,
        appointment: {
          customerName: name,
          service: apptService,
          zone: zone.name,
          crew: zone.crew,
          slot: { start: slot.start, end: slot.end, label: slot.label },
          calendarLink: calEvent.data.htmlLink
        },
        message: `Appointment confirmed! ${zone.crew} will contact you to confirm. A text confirmation has been sent to ${phone}.`
      })};
    }

    return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Invalid action' }) };

  } catch (err) {
    console.error('Scheduling error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
