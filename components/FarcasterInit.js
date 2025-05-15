'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/frame-sdk'

/**
 * Component that handles Farcaster MiniApp initialization
 * This component should be rendered early in the app so it can
 * initialize the SDK and hide the splash screen when ready
 */
export default function FarcasterInit() {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Wait for document to be fully loaded for smoother transition
        if (document.readyState === 'complete') {
          await callReady();
        } else {
          window.addEventListener('load', callReady);
          return () => window.removeEventListener('load', callReady);
        }
      } catch (error) {
        console.error('Error initializing Farcaster SDK:', error)
      }
    }

    const callReady = async () => {
      // Small delay to ensure UI is fully rendered
      setTimeout(async () => {
        try {
          // Initialize the Farcaster SDK and hide the splash screen
          await sdk.actions.ready({
            // Disable native gestures if your app has custom swipe interactions
            disableNativeGestures: false
          });
          setInitialized(true);
        } catch (err) {
          console.error('Error calling sdk.actions.ready:', err);
        }
      }, 300);
    };

    // Only run on the client
    if (typeof window !== 'undefined') {
      initFarcaster();
    }
  }, []);

  // This component doesn't render anything visible
  return null;
} 