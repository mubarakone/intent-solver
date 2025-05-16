// Debugging endpoint to help diagnose Farcaster integration issues

export async function GET(request) {
  try {
    // Get request headers and URL for debugging
    const headers = Object.fromEntries(request.headers);
    const url = request.url;
    
    // Get environment info
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
    };
    
    // Check for Farcaster-specific headers
    const farcasterHeaders = Object.keys(headers)
      .filter(key => key.toLowerCase().includes('farcaster') || key.toLowerCase().includes('fc:'))
      .reduce((obj, key) => {
        obj[key] = headers[key];
        return obj;
      }, {});
    
    // Return all information for debugging
    return new Response(
      JSON.stringify({
        message: 'Farcaster debugging information',
        timestamp: new Date().toISOString(),
        requestUrl: url,
        environment: envInfo,
        headers: headers,
        farcasterSpecificHeaders: farcasterHeaders
      }, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

export async function POST(request) {
  try {
    // Get the raw body for debugging
    const rawBody = await request.text();
    let parsedBody = {};
    
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (e) {
      parsedBody = { parseError: e.message, rawBody };
    }
    
    // Get request headers
    const headers = Object.fromEntries(request.headers);
    
    // Return all information for debugging
    return new Response(
      JSON.stringify({
        message: 'Farcaster frame POST debug information',
        timestamp: new Date().toISOString(),
        headers: headers,
        body: parsedBody,
        rawBody: rawBody
      }, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
} 