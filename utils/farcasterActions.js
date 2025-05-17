'use client'

import { sdk } from '@farcaster/frame-sdk'
import { isMiniAppSafe } from './isMiniApp'
import { baseSepolia } from 'wagmi/chains'

/**
 * Utility functions for Farcaster-specific actions
 * These functions are all client-side only but safe to import in SSR context
 */

/**
 * Open a URL in the appropriate context
 * In MiniApp: Uses the Farcaster SDK to open URLs externally
 * In standalone: Opens URL in a new tab
 * 
 * @param {string} url - The URL to open
 * @param {boolean} closeAfter - Whether to close the MiniApp after opening (MiniApp only)
 * @returns {Promise<void>}
 */
export const openUrl = async (url, closeAfter = false) => {
  // SSR guard
  if (typeof window === 'undefined') return;
  
  if (isMiniAppSafe()) {
    try {
      await sdk.actions.openUrl({
        url,
        close: closeAfter
      })
    } catch (error) {
      console.error('Error opening URL in Farcaster:', error)
      // Fallback to regular window open
      window.open(url, '_blank')
    }
  } else {
    // Regular web browser behavior
    window.open(url, '_blank')
  }
}

/**
 * Close the MiniApp with an optional toast message
 * In standalone web app context, this just returns (no-op)
 * 
 * @param {string} message - Optional toast message to display when closing
 * @returns {Promise<void>}
 */
export const closeMiniApp = async (message = '') => {
  // SSR guard
  if (typeof window === 'undefined') return;
  
  if (isMiniAppSafe()) {
    try {
      await sdk.actions.close({
        toast: message ? { message } : undefined
      })
    } catch (error) {
      console.error('Error closing MiniApp:', error)
    }
  }
  // No-op in standalone web app
}

/**
 * Get the Farcaster user's connected Ethereum address
 * This is useful for pre-filling forms in the MiniApp context
 * 
 * @returns {Promise<string|null>} The Ethereum address or null if not connected/available
 */
export const getFarcasterEthAddress = async () => {
  // SSR guard
  if (typeof window === 'undefined') return null;
  
  if (!isMiniAppSafe()) return null
  
  try {
    const accounts = await sdk.wallet.ethProvider.request({
      method: 'eth_requestAccounts'
    })
    return accounts[0] || null
  } catch (error) {
    console.error('Error getting Farcaster Ethereum address:', error)
    return null
  }
}

/**
 * Switch to the Base Sepolia network in Farcaster MiniApp context
 * 
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const switchToBaseSepolia = async () => {
  // SSR guard
  if (typeof window === 'undefined') return false;
  
  if (!isMiniAppSafe()) return false;
  
  try {
    // First check if we're already on Base Sepolia
    const { chainId } = await sdk.wallet.ethProvider.request({ 
      method: 'eth_chainId' 
    });
    
    // Convert from hex to decimal
    const currentChainId = parseInt(chainId, 16);
    
    // If already on Base Sepolia, return success
    if (currentChainId === baseSepolia.id) {
      return true;
    }
    
    // Otherwise switch to Base Sepolia
    await sdk.wallet.ethProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${baseSepolia.id.toString(16)}` }]
    });
    
    return true;
  } catch (error) {
    console.error('Error switching to Base Sepolia:', error);
    
    // If the chain isn't added yet, try to add it
    if (error.code === 4902) {
      try {
        await sdk.wallet.ethProvider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${baseSepolia.id.toString(16)}`,
              chainName: baseSepolia.name,
              nativeCurrency: baseSepolia.nativeCurrency,
              rpcUrls: [baseSepolia.rpcUrls.default.http[0]],
              blockExplorerUrls: [baseSepolia.blockExplorers?.default.url]
            }
          ]
        });
        return true;
      } catch (addError) {
        console.error('Error adding Base Sepolia chain:', addError);
        return false;
      }
    }
    
    return false;
  }
} 