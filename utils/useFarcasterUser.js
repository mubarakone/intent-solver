'use client'

import { useState, useEffect } from 'react'
import { isMiniAppSafe } from './isMiniApp'
import { getFarcasterEthAddress } from './farcasterActions'

/**
 * Custom hook to access Farcaster user information
 * This provides streamlined access to user data when running in MiniApp context
 * Safe to use with SSR
 */
export function useFarcasterUser() {
  const [ethAddress, setEthAddress] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFarcasterContext, setIsFarcasterContext] = useState(false)

  useEffect(() => {
    const checkFarcasterContext = () => {
      const isFarcaster = isMiniAppSafe()
      setIsFarcasterContext(isFarcaster)
      return isFarcaster
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        
        if (!checkFarcasterContext()) {
          setIsLoading(false)
          return
        }
        
        // Get connected address in Farcaster context
        const address = await getFarcasterEthAddress()
        setEthAddress(address)
        
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching Farcaster user data:', err)
        setError(err)
        setIsLoading(false)
      }
    }

    // Only fetch data if we're in the browser
    if (typeof window !== 'undefined') {
      fetchUserData()
    } else {
      // In SSR context, just mark as not loading
      setIsLoading(false)
    }
  }, [])

  return {
    ethAddress,
    isLoading,
    error,
    isFarcasterContext
  }
} 