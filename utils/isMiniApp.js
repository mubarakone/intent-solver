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
    // The Frame SDK introduces a specific object in the window
    // This is a simple heuristic and may need adjustments
    return window.location.href.includes('warpcast.com') || 
           window.navigator.userAgent.includes('Farcaster') ||
           typeof window.__FARCASTER_FRAME_SDK__ !== 'undefined';
  } catch (e) {
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