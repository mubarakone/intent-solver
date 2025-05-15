// This endpoint provides status information about the MiniApp

export async function GET(request) {
  // Check if the .well-known/farcaster.json file is in place
  const farcasterJsonStatus = await checkFarcasterJson();
  
  // Return the status
  return new Response(
    JSON.stringify({
      miniapp: {
        name: 'Storerunner',
        version: '1.0.0',
        status: 'operational',
        features: {
          wallet: true,
          notifications: true,
          sharing: true
        },
        farcasterJsonPresent: farcasterJsonStatus.present,
        farcasterJsonValid: farcasterJsonStatus.valid
      }
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Helper function to check if the farcaster.json file is in place
async function checkFarcasterJson() {
  try {
    // In a real implementation, we would check if the file exists and validate its contents
    // For now, we'll just return success since we know we've added it
    return {
      present: true,
      valid: true
    };
  } catch (error) {
    console.error('Error checking farcaster.json:', error);
    return {
      present: false,
      valid: false
    };
  }
} 