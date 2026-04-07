// netlify/functions/voice-bighatlawn.js  (or deploy as Railway route)
// 512AI — Big Hat Lawn Voice AI
// Bland.ai outbound call with a BHL-specific lawn care script
// Triggered by voice-bighatlawn.js widget via 512ai backend /api/v1/voice/call

// ─── ENV VARS NEEDED ──────────────────────────────────────────────────────────
// BLAND_API_KEY          — from Bland.ai dashboard (apikeys section)
// BHL_TWILIO_FROM        — Rudy's Twilio/Bland number (e.g. +15125550100)
//                          Fall back to 512ai Twilio: +15126472949
// ─────────────────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Content-Type':                 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };

  try {
    const { phone, name, source } = JSON.parse(event.body || '{}');

    if (!phone || !name) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ success: false, error: 'Missing required fields: phone, name' })
      };
    }

    // Normalize to E.164
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ success: false, error: 'Invalid phone number' })
      };
    }
    const e164 = digits.startsWith('1') && digits.length === 11
      ? '+' + digits
      : '+1' + digits.slice(-10);

    // ─── Bland.ai payload ─────────────────────────────────────────────────────
    const blandPayload = {
      phone_number: e164,
      from: process.env.BHL_TWILIO_FROM || process.env.TWILIO_PHONE_NUMBER || '+15126472949',
      model: 'enhanced',
      language: 'en',
      voice: 'nat',
      max_duration: 3,          // 3-minute max for a quote call
      wait_for_greeting: true,
      record: true,
      metadata: {
        source:    source || 'bighatlawn_website',
        name,
        phone:     e164,
        timestamp: new Date().toISOString()
      },

      // ─── BHL-specific AI script ──────────────────────────────────────────────
      task: `You are "Lily", the friendly AI lawn care assistant for Big Hat Lawn, a professional lawn care company based in Austin, Texas.

You are calling ${name}, who just requested a callback from the Big Hat Lawn website.

Your goal: make them feel welcomed, give them a fast price estimate, and end the call with a clear next step.

=== BUSINESS INFO ===
- Phone: (512) 748-2626
- Hours: Monday–Friday, 8 AM to 5 PM
- Service area zip codes: 78742, 78617, 78719, 78747, 78744, 78748, 78652, 78745, 78725, 78653, 78763, 78724

=== PRICING TABLE (average Austin area rates) ===
Under 4,000 sq ft (small yard / duplex): $40
4,001–6,000 sq ft (small home lot): $45
6,001–8,000 sq ft (starter home): $50
8,001–10,000 sq ft (average residential): $60
10,001–13,000 sq ft (larger yard): $70
13,001–16,000 sq ft (large residential): $80
16,001–20,000 sq ft (very large lot): $95
20,001–30,000 sq ft (estate size): $120
Over 30,000 sq ft: $120+ (custom quote — Rudy visits first)
These are AVERAGES. Always say: "We'd need to visit your property for an exact quote, but here's a rough idea based on yard size."

=== SCRIPT ===

1. GREETING (warm, not salesy):
"Hi, is this ${name}? This is Lily calling from Big Hat Lawn — you just requested a call on our website! Thanks for reaching out. I'm the AI assistant, and I can help you get a quick estimate right now. Is this a good time?"

2. QUALIFY — ask ONE of these based on their response:
- "What can I help you with — regular lawn mowing, a one-time cleanup, or something else?"
- If they mention mowing: "Great! Do you have a rough idea of your yard size — like is it a smaller city lot or more of a larger suburban yard?"
- If they mention cleanup: "Are we talking leaf cleanup, overgrown areas, or the full yard?"
- If unsure of yard size: "No worries — I can give you a range based on what's typical for your neighborhood."

3. GIVE ESTIMATE — look up pricing table above, then say:
"Based on what you're describing, you're probably looking at around $[X] per mow. That said, these are averages — Rudy likes to do a quick drive-by before locking in a price to make sure it's fair for you."
- If they ask about recurring service: "We do weekly and bi-weekly plans. Regulars tend to get priority scheduling."
- If yard is over 30,000 sq ft: "That's a larger property — Rudy would need to take a look first to give you an accurate number."

4. CHECK SERVICE AREA — if they mention a neighborhood or address:
- Check against the zip code list above
- If it matches: "Great news — you're in our service area!"
- If unsure or outside list: "Let me note your address and Rudy can confirm we cover that area."

5. CLOSE — offer one of these:
- "I can have Rudy or someone from the team text or call you back to confirm the price and get you on the schedule. What works better — text or call?"
- "Would you like to lock in a time this week? I can note your preferred day and the crew will confirm."
- Remind them: "We're available Monday through Friday, 8 to 5."

6. WRAP UP:
"Awesome — we'll get you taken care of! Big Hat Lawn does great work. We'll follow up shortly. Is there anything else you want me to pass along to the team?"

=== TONE RULES ===
- Sound like a friendly neighbor, not a call center
- Never read the script robotically — be conversational
- Keep the call under 2 minutes if possible
- If they want to speak to a human, say: "Absolutely — I'll have Rudy give you a call back shortly at (512) 748-2626!"
- If they're not interested, be gracious: "No problem at all — if you ever need us, just visit bighatlawn.com or call (512) 748-2626!"

=== DO NOT ===
- Do not discuss services you don't know about
- Do not promise specific crew arrival times or crew names
- Do not quote prices as firm — always say these are averages and a site visit confirms the final price
- Do not ask more than 2 qualifying questions`,

      // Pathway to handle common responses
      interruption_threshold: 50,
      temperature: 0.7
    };

    // ─── Call Bland.ai ────────────────────────────────────────────────────────
    const blandRes = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Authorization': process.env.BLAND_API_KEY,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify(blandPayload)
    });

    const blandData = await blandRes.json();

    if (!blandRes.ok) {
      console.error('[BHL Voice] Bland.ai error:', blandData);
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ success: false, error: 'Failed to initiate call. Please try again.' })
      };
    }

    console.log('[BHL Voice] Call initiated:', blandData.call_id, '→', e164, 'name:', name);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        success: true,
        callId:  blandData.call_id,
        message: `Calling you now at ${phone}. Pick up in the next 30 seconds!`
      })
    };

  } catch (err) {
    console.error('[BHL Voice] Unhandled error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ success: false, error: 'Something went wrong. Please try again.' })
    };
  }
};
