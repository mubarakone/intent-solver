// This route handles webhooks from Farcaster

export async function POST(request) {
  try {
    // Parse the webhook payload
    const requestJson = await request.text();
    const payload = JSON.parse(requestJson);
    
    console.log('Received Farcaster webhook event:', payload);
    
    // For a production app, you should verify the webhook signature using:
    // const data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
    
    switch (payload.event) {
      case 'frame_added':
        // Handle when a user adds your MiniApp
        await handleFrameAdded(payload);
        break;
        
      case 'frame_removed':
        // Handle when a user removes your MiniApp
        await handleFrameRemoved(payload);
        break;
        
      case 'notifications_enabled':
        // Handle when a user enables notifications
        await handleNotificationsEnabled(payload);
        break;
        
      case 'notifications_disabled':
        // Handle when a user disables notifications
        await handleNotificationsDisabled(payload);
        break;
        
      default:
        console.log('Unknown event type:', payload.event);
    }
    
    // Send an OK response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing Farcaster webhook:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// For a production app, you would implement these handlers
// to store tokens in your database for sending notifications
async function handleFrameAdded(payload) {
  console.log('User added MiniApp');
  
  // Store notification details if available
  if (payload.notificationDetails) {
    const { token, url } = payload.notificationDetails;
    console.log('Notification token:', token);
    console.log('Notification URL:', url);
    
    // TODO: Store the token and URL in your database associated with the user
    // This will allow you to send notifications to this user later
  }
}

async function handleFrameRemoved(payload) {
  console.log('User removed MiniApp');
  
  // TODO: Remove any stored notification tokens for this user
}

async function handleNotificationsEnabled(payload) {
  console.log('User enabled notifications');
  
  if (payload.notificationDetails) {
    const { token, url } = payload.notificationDetails;
    console.log('New notification token:', token);
    console.log('Notification URL:', url);
    
    // TODO: Store or update the token and URL in your database
  }
}

async function handleNotificationsDisabled(payload) {
  console.log('User disabled notifications');
  
  // TODO: Mark the user as having disabled notifications in your database
} 