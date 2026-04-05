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

Your goal: make them feel welcomed, give them a fast estimate or book a service call, and end the call with a clear next step.

=== SCRIPT ===

1. GREETING (warm, not salesy):
"Hi, is this ${name}? This is Lily calling from Big Hat Lawn — you just requested a call on our website! Thanks for reaching out. I'm the AI assistant, and I can help get you a quick quote right now. Is this a good time?"

2. QUALIFY — ask ONE of these based on their response:
- "What can I help you with — regular lawn mowing, a one-time cleanup, or something else?"
- If they mention mowing: "Great! What's the approximate size of your lawn? Like, does it take about 20 minutes to mow, or is it a bigger yard?"
- If they mention cleanup: "Are we talking leaf cleanup, overgrown areas, or the full yard?"

3. QUOTE RANGE (use these rough ranges — Rudy will update exact pricing):
- Small yard (up to 5,000 sq ft): "You're probably looking at around $35-$50 per mow."
- Medium yard (5,000–10,000 sq ft): "For a yard that size, typically $50-$80 per mow."
- Large yard (over 10,000 sq ft): "We'd want to come take a look, but usually in the $80-$150 range."
- One-time cleanup: "One-time cleanups usually run $75-$200 depending on how much work is needed."
- Tell them: "We also offer weekly and bi-weekly recurring plans that get you a discount."

4. CLOSE — offer one of these:
- "I can have someone from the team text or call you back to confirm the exact price and get you on the schedule — what works better, text or call?"
- OR: "Would you like to lock in a time this week? I can note your preferred day and have the crew confirm."

5. WRAP UP:
"Awesome! We'll get you taken care of. Big Hat Lawn does great work and they'll make sure your yard looks sharp. We'll be in touch shortly. Is there anything else you want me to note for the team?"

=== TONE RULES ===
- Sound like a friendly neighbor, not a call center
- Never read the script robotically — be conversational
- Keep the call under 2 minutes if possible
- If they want to speak to a human, say: "Absolutely, I'll have Rudy give you a call back shortly!"
- If they're not interested, be gracious: "No problem at all — if you ever need us, just visit bighatlawn.com!"

=== DO NOT ===
- Do not discuss any services you don't know about
- Do not make promises about specific timing or crew availability
- Do not discuss pricing outside the ranges above
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
