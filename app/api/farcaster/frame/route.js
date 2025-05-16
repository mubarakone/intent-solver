// This is the Frame endpoint for handling Farcaster Frame actions
// See https://docs.farcaster.xyz/reference/frames/spec for more details

export async function POST(request) {
  try {
    // Parse the incoming Frame message
    const body = await request.json();
    console.log('Received frame request:', body);

    // Extract frame data from the request
    const { trustedData, untrustedData } = body;
    
    // Build the next frame response
    const frameResponse = {
      version: 'vNext',
      image: 'https://storerunner.xyz/sharing-image.png',
      buttons: [
        {
          label: 'Visit Storerunner',
          action: 'link',
          target: 'https://storerunner.xyz'
        }
      ]
    };

    // Return the frame response
    return new Response(
      JSON.stringify(frameResponse),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (error) {
    console.error('Error handling frame request:', error);
    
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