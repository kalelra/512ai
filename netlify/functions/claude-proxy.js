exports.handler = async (event) => {
  const allowedOrigin = process.env.SITE_URL || 'https://512ai.co';

  const commonHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle browser preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: commonHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: commonHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const origin = event.headers.origin || event.headers.Origin || '';

    if (origin && origin !== allowedOrigin) {
      return {
        statusCode: 403,
        headers: commonHeaders,
        body: JSON.stringify({ error: 'Forbidden origin' })
      };
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        statusCode: 500,
        headers: commonHeaders,
        body: JSON.stringify({ error: 'Missing server API configuration' })
      };
    }

    const rawBody = event.body || '';
    if (rawBody.length > 10000) {
      return {
        statusCode: 413,
        headers: commonHeaders,
        body: JSON.stringify({ error: 'Request too large' })
      };
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return {
        statusCode: 400,
        headers: commonHeaders,
        body: JSON.stringify({ error: 'Invalid JSON body' })
      };
    }

    const question = body?.messages?.[0]?.content;
    const system = body?.system;

    if (typeof system !== 'string' || !system.trim()) {
      return {
        statusCode: 400,
        headers: commonHeaders,
        body: JSON.stringify({ error: 'Missing system prompt' })
      };
    }

    if (typeof question !== 'string' || !question.trim()) {
      return {
        statusCode: 400,
        headers: commonHeaders,
        body: JSON.stringify({ error: 'Missing customer question' })
      };
    }

    // Keep the frontend from choosing arbitrary models or token counts
    const payload = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: system.trim().slice(0, 2000),
      messages: [
        {
          role: 'user',
          content: question.trim().slice(0, 2000)
        }
      ]
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: commonHeaders,
        body: JSON.stringify({
          error: 'Upstream AI request failed',
          details: data?.error?.message || 'Unknown upstream error'
        })
      };
    }

    return {
      statusCode: 200,
      headers: commonHeaders,
      body: JSON.stringify({
        content: data.content || []
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: commonHeaders,
      body: JSON.stringify({
        error: 'Internal server error',
        details: err.message
      })
    };
  }
};
