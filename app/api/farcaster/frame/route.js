// This is the Frame endpoint for handling Farcaster Frame interactions
// See https://docs.farcaster.xyz/reference/frames/spec for more details

export async function POST(request) {
  try {
    // Parse the incoming Frame message
    const body = await request.json();
    console.log('Received frame request:', body);

    // Extract frame data from the request
    const { trustedData, untrustedData } = body;
    
    // Build the next frame response in the specific format expected by Farcaster
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

    // Return the frame response with the correct headers
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
    
    // Return a fallback frame response in case of error
    const errorResponse = {
      version: 'vNext',
      image: 'https://storerunner.xyz/sharing-image.png',
      buttons: [
        {
          label: 'Try Again',
          action: 'post'
        }
      ],
      text: 'Something went wrong. Please try again.'
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 200, // Still return 200 with an error frame
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
} 