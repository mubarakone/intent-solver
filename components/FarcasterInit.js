'use client'

import React, { useEffect } from 'react';
import { switchToBaseSepolia } from '../utils/farcasterActions';

/**
 * Component that initializes Farcaster MiniApp features
 * - Calls the ready() method to dismiss splash screen
 * - Sets up event listeners
 * - Initializes all Farcaster SDK features needed
 * - Switches to Base Sepolia network
 */
export default function FarcasterInit() {
  useEffect(() => {
    async function initFarcaster() {
      try {
        console.log('FarcasterInit: Initializing...');
        
        // Wait for window to be fully defined
        if (typeof window === 'undefined') return;
        
        // Give browser time to load everything
        setTimeout(async () => {
          if (window.sdk && window.sdk.actions && typeof window.sdk.actions.ready === 'function') {
            console.log('FarcasterInit: Calling ready()');
            try {
              await window.sdk.actions.ready();
              console.log('FarcasterInit: Ready called successfully');
              
              // After ready is called, attempt to switch to Base Sepolia
              // This is done after ready to avoid UI conflicts with the splash screen
              setTimeout(async () => {
                try {
                  const success = await switchToBaseSepolia();
                  console.log('FarcasterInit: Switch to Base Sepolia ' + (success ? 'successful' : 'failed'));
                } catch (chainError) {
                  console.error('FarcasterInit: Error switching chain:', chainError);
                }
              }, 1500);
              
            } catch (error) {
              console.error('FarcasterInit: Error calling ready()', error);
            }
          } else {
            console.warn('FarcasterInit: Farcaster SDK not available');
            
            // Try to load the SDK if not available
            try {
              const module = await import('@farcaster/frame-sdk');
              if (module && module.sdk) {
                console.log('FarcasterInit: SDK imported, calling ready()');
                await module.sdk.actions.ready();
                console.log('FarcasterInit: Ready called successfully after import');
                
                // After ready is called, attempt to switch to Base Sepolia
                setTimeout(async () => {
                  try {
                    const success = await switchToBaseSepolia();
                    console.log('FarcasterInit: Switch to Base Sepolia ' + (success ? 'successful' : 'failed'));
                  } catch (chainError) {
                    console.error('FarcasterInit: Error switching chain:', chainError);
                  }
                }, 1500);
              } else {
                console.warn('FarcasterInit: SDK import successful but SDK object not available');
              }
            } catch (e) {
              console.error('FarcasterInit: Failed to import SDK:', e);
            }
          }
        }, 1000); // Delay to ensure everything is loaded
      } catch (error) {
        console.error('FarcasterInit: Error during initialization', error);
      }
    }

    initFarcaster();
  }, []);

  // This component doesn't render anything
  return null;
} 