// netlify/functions/voice-demo.js
// 512AI — Bland.ai voice call trigger
// Triggered by the website demo widget when a visitor clicks "Call Me"

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // CORS headers — allow calls from 512ai.co and localhost
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { phone, name, businessType } = JSON.parse(event.body);

    // Validate inputs
    if (!phone || !name || !businessType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Missing required fields: phone, name, businessType' })
      };
    }

    // Clean phone number — remove everything except digits and leading +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 10) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid phone number' })
      };
    }

    // Format to E.164 if not already
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+1${cleanPhone}`;

    // Build the AI prompt based on business type
    const businessContext = getBusinessContext(businessType);

    // Bland.ai call configuration
    const blandPayload = {
      phone_number: formattedPhone,
      task: `You are a friendly AI assistant demo from 512AI, an AI automation company based in Austin, Texas.

You are calling ${name}, who owns or works at a ${businessType} business.

Your goal is to give them a 60-second taste of what AI automation can do for their specific business.

Script:
1. Greet them warmly: "Hi ${name}! This is the 512AI assistant calling from Austin. You just requested a quick demo on our website — I'm the AI voice assistant. Pretty cool that you're talking to AI right now, right?"

2. Personalize to their business: "${businessContext}"

3. Show capability: "I can do this 24/7 for your business — answer calls, capture leads, book appointments, and route customers — while you focus on the actual work."

4. Close with next step: "Ricardo at 512AI would love to show you the full picture on a free 30-minute call. You can book at 512ai.co. Any questions before I let you go?"

5. Wrap up warmly and professionally.

Keep the entire call under 90 seconds. Be conversational, not salesy. Sound like a real helpful assistant, not a robot reading a script.`,

      model: 'enhanced',
      language: 'en',
      voice: 'nat', // Natural sounding voice
      max_duration: 2, // 2 minutes max
      wait_for_greeting: true,
      record: true,
      metadata: {
        source: '512ai_website_demo',
        name,
        businessType,
        timestamp: new Date().toISOString()
      }
    };

    // Log request payload (no sensitive data)
    console.log('Bland.ai request payload:', JSON.stringify({
      phone_number: formattedPhone,
      model: blandPayload.model,
      language: blandPayload.language,
      voice: blandPayload.voice,
      max_duration: blandPayload.max_duration,
      wait_for_greeting: blandPayload.wait_for_greeting,
      record: blandPayload.record,
      metadata: blandPayload.metadata
    }));

    // Call Bland.ai API
    const response = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Authorization': process.env.BLAND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(blandPayload)
    });

    const result = await response.json();

    // Log full Bland.ai response
    console.log('Bland.ai full response — status:', response.status, 'body:', JSON.stringify(result));

    if (!response.ok) {
      console.error('Bland.ai error — status:', response.status, 'body:', JSON.stringify(result));
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Bland.ai returned an error',
          blandStatus: response.status,
          blandResponse: result
        })
      };
    }

    console.log('Call initiated:', result.call_id, 'for', name, 'at', formattedPhone);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        callId: result.call_id,
        message: `Calling you now at ${phone}. Pick up in the next 30 seconds!`
      })
    };

  } catch (err) {
    console.error('Voice demo error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message, stack: err.stack })
    };
  }
};

function getBusinessContext(businessType) {
  const contexts = {
    'Restaurant / Food Service': `Tell them: "For a restaurant like yours, I can answer calls during the dinner rush when your staff is slammed — handle reservation questions, menu inquiries, hours, and even take call-ahead orders. No more missed calls during your busiest hours."`,
    'HVAC / Plumbing / Electrical': `Tell them: "For a trades business like yours, I can answer every call when you're on a job site — capture the customer's name, address, what's wrong, and how urgent it is. No more voicemails that turn into lost jobs. I can even route emergency calls immediately."`,
    'Landscaping & Sprinkler / Irrigation': `Tell them: "For your landscaping business, I can handle quote requests, schedule service calls, and route jobs to the right crew based on area — so you're never overbooking or sending crews across town unnecessarily."`,
    'Salon / Barbershop / Beauty': `Tell them: "For a salon, I can book appointments 24/7 — even at 11pm when a customer wants to schedule for next week. I handle the scheduling, send reminders, and can even fill last-minute cancellations automatically."`,
    'Auto Repair / Body Shop': `Tell them: "For an auto shop, I can answer calls when the front desk is busy, get the customer's name, vehicle, and issue, and let them know approximate wait times — so no customer ever feels ignored."`,
    'Medical / Dental / Healthcare': `Tell them: "For a medical practice, I can handle appointment scheduling, answer common patient questions about hours and insurance, and send appointment reminders — freeing up your front desk for what actually matters."`,
    'Real Estate Agent / Brokerage': `Tell them: "For real estate, I can respond to new leads instantly — even at midnight — qualify them with a few questions, and schedule showings. The first agent to respond wins the client, and I respond in seconds."`,
    'General Contractor / Remodeling': `Tell them: "For a contracting business, I can capture every estimate request, get the project details, and follow up automatically — so no lead falls through the cracks while you're on a job site."`,
    'Gym / Fitness Studio': `Tell them: "For a gym or studio, I can convert website visitors into members by answering their questions, offering a free trial, and booking their first class — all automatically, 24/7."`,
    'Cleaning Service': `Tell them: "For a cleaning business, I can handle quote requests, book recurring appointments, and send reminders — so you spend your time cleaning, not answering the same questions over and over."`,
    'Law Office / Legal Services': `Tell them: "For a law firm, I can screen new client inquiries 24/7 — get their name, legal issue, and urgency — and route them to the right attorney or schedule a consultation. No lead goes unanswered."`,
    'Retail Store': `Tell them: "For retail, I can answer calls about hours, inventory, and promotions, and even take phone orders — so your staff focuses on in-store customers instead of the phone."`,
    'Pet Services': `Tell them: "For a pet business, I can handle boarding reservations, grooming bookings, and vaccination record questions — so pet parents always get a quick, caring response."`,
    'Food Truck / Mobile Vendor': `Tell them: "For a food truck, I can let customers know your daily location, handle catering inquiries, and build your text list automatically — so your loyal fans always know where to find you."`,
    'Accounting / Tax Prep': `Tell them: "For an accounting firm, I can handle new client intake, collect the documents you need, and send automated reminders — especially during tax season when every hour counts."`,
    'Insurance Agency': `Tell them: "For insurance, I can qualify new leads, answer common coverage questions, and schedule consultations — so you spend your time closing, not chasing."`,
    'Other': `Tell them: "Whatever your business does, I can handle your inbound calls, capture leads, and make sure no customer ever goes unanswered — even nights and weekends."`,
  };

  return contexts[businessType] || contexts['Other'];
}
