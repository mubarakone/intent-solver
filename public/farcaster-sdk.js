// This script loads the Farcaster SDK and calls ready() when the page is loaded
(async function() {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      console.log('Initializing Farcaster SDK...');
      
      // Try to load the SDK from the global context if available
      let sdk;
      if (window.sdk) {
        console.log('Using globally available Farcaster SDK');
        sdk = window.sdk;
      } else {
        // Dynamically import the SDK if not already available
        console.log('Importing Farcaster SDK dynamically');
        try {
          const module = await import('https://esm.sh/@farcaster/frame-sdk');
          sdk = module.sdk;
          window.sdk = sdk; // Make it globally available
        } catch (importError) {
          console.error('Failed to import Farcaster SDK:', importError);
        }
      }

      // Wait for page to be fully loaded
      window.addEventListener('load', function() {
        setTimeout(() => {
          if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
            console.log('Calling sdk.actions.ready()');
            sdk.actions.ready()
              .then(() => console.log('SDK ready call successful'))
              .catch(error => console.error('SDK ready call failed:', error));
          } else {
            console.warn('Farcaster SDK ready method not available');
          }
        }, 500); // Add a small delay to ensure everything is loaded
      });

      // Also try to call ready immediately if DOM is already loaded
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => {
          if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
            console.log('Calling sdk.actions.ready() immediately');
            sdk.actions.ready()
              .then(() => console.log('Immediate SDK ready call successful'))
              .catch(error => console.error('Immediate SDK ready call failed:', error));
          }
        }, 1000);
      }
    }
  } catch (e) {
    console.error('Error in Farcaster SDK initialization:', e);
  }
})(); 