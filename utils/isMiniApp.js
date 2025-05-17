'use client'

/**
 * Utility to detect if the app is running as a Farcaster MiniApp
 * 
 * This checks for the presence of the Farcaster SDK in the window object
 * which is only available when running inside the Farcaster client
 */
export const isMiniApp = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for Farcaster Frame SDK
  try {
    // Multiple detection methods for better accuracy
    
    // Method 1: Check for Frame SDK object
    const hasFrameSDK = typeof window.sdk !== 'undefined' || 
                         typeof window.__FARCASTER_FRAME_SDK__ !== 'undefined';
    
    // Method 2: Check URL for farcaster-specific parameters or hosts
    const isInFarcasterURL = window.location.href.includes('warpcast.com') || 
                             window.location.href.includes('farcaster.xyz') ||
                             window.location.search.includes('farcaster');
    
    // Method 3: Check for Farcaster in user agent
    const isFarcasterAgent = window.navigator.userAgent.includes('Farcaster') ||
                             window.navigator.userAgent.includes('Warpcast');
    
    // Method 4: Try to access Frame SDK capabilities
    let hasSDKCapabilities = false;
    if (window.sdk && typeof window.sdk.isFrameContext === 'function') {
      try {
        hasSDKCapabilities = window.sdk.isFrameContext();
      } catch (e) {
        console.log('Error checking Frame SDK capabilities:', e);
      }
    }
    
    // Return true if any detection method succeeds
    return hasFrameSDK || isInFarcasterURL || isFarcasterAgent || hasSDKCapabilities;
  } catch (e) {
    console.log('Error detecting Farcaster environment:', e);
    return false;
  }
};

/**
 * Safe version of isMiniApp that can be used in both server and client contexts
 * This always returns false during server-side rendering
 */
export const isMiniAppSafe = () => {
  return typeof window !== 'undefined' ? isMiniApp() : false;
} 