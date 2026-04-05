# 512AI Scheduling & Routing Engine — Setup Guide

## What's built

### 1. scheduling-engine.js (Netlify Function)
Full scheduling backend that:
- Routes zipcodes to 5 service zones
- Checks Google Calendar for availability
- Prevents double-booking
- Books appointments to Google Calendar
- Sends SMS confirmation via Twilio

### 2. scheduling-demo-widget.html (Website Section)
Interactive demo for 512ai.co that:
- Lets visitors enter any Austin zipcode
- Shows which crew covers their area
- Shows available time slots (simulated for demo)
- Walks through the full booking flow
- Converts to Calendly CTA after demo

---

## Step 1 — Add the demo widget to 512ai.co

Open Claude Code:
```bash
cd ~/Claude_Projects/512ai
claude
```

Paste this prompt:
```
Read CLAUDE.md. Do these two things:

1. Add "Scheduling" to the navigation links between "Voice Demo" and "About"

2. Insert the contents of ~/Claude_Projects/512ai/files/scheduling-demo-widget.html as a new section in index.html, placed BETWEEN the #voice-demo section and the #how section.

Then: git add . && git commit -m "Add scheduling demo section" && git push
```

---

## Step 2 — Set up Google Calendar API (for the real backend)

The demo widget works without this. Only needed when wiring up real bookings.

1. Go to console.cloud.google.com
2. Create a new project: "512AI Scheduling"
3. Enable the Google Calendar API
4. Create a Service Account
5. Download the JSON key file
6. Share your Google Calendar with the service account email

Then add to Netlify environment variables:
- GOOGLE_CLIENT_EMAIL = service account email
- GOOGLE_PRIVATE_KEY = private key from JSON (keep \n characters)
- GOOGLE_CALENDAR_ID = your calendar ID (find in Google Calendar settings)

---

## Step 3 — Copy the scheduling function

```bash
cp ~/Claude_Projects/512ai/files/scheduling-engine.js ~/Claude_Projects/512ai/netlify/functions/scheduling-engine.js
npm install googleapis --prefix ~/Claude_Projects/512ai
git add . && git commit -m "Add scheduling engine Netlify function" && git push
```

---

## Step 4 — Test the scheduling endpoint

```bash
curl -s -X POST "https://512ai.co/.netlify/functions/scheduling-engine" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"check_availability\",\"zipcode\":\"78701\",\"serviceType\":\"Sprinkler Repair\"}"
```

Should return zone info and available slots.

---

## Service Zone Map

| Zone | Areas | Zipcodes |
|------|-------|---------|
| Central (Crew A) | Austin Downtown/Central | 78701-78705, 78751-78756 |
| North (Crew B) | North Austin, Round Rock, Cedar Park | 78613, 78628, 78681, 78750, 78757-78759 |
| South (Crew C) | South Austin, Buda, Kyle | 78610, 78640, 78744-78749 |
| East (Crew D) | East Austin, Pflugerville, Manor | 78653, 78660, 78721-78725 |
| West (Crew E) | West Austin, Lakeway, Bee Cave | 78669, 78732-78739 |

---

## After Daniel discovery call — customize:
- Replace crew names with Daniel's actual crew names
- Adjust zipcodes per his actual service area
- Set his real business hours
- Add his Google Calendar ID
- Configure SMS from his Twilio number
