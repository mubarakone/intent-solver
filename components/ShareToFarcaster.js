'use client'

import { useState } from 'react'
import { openUrl } from '../utils/farcasterActions'
import MiniAppButton from './MiniAppButton'

/**
 * Component to share content to Farcaster
 * This provides a button to share content to Farcaster
 */
export default function ShareToFarcaster({ 
  url = '', 
  text = 'Check out Storerunner!',
  onSuccess,
  className = ''
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Create a Warpcast share URL
  const shareUrl = encodeURI(`https://warpcast.com/~/compose?text=${text}&embeds[]=${url || window.location.href}`)

  const handleShare = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Open the share URL
      await openUrl(shareUrl)

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess()
      }
    } catch (err) {
      console.error('Error sharing to Farcaster:', err)
      setError(err.message || 'Failed to share to Farcaster')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={className}>
      <MiniAppButton
        onClick={handleShare}
        loading={isLoading}
        type="secondary"
        size="sm"
      >
        Share to Farcaster
      </MiniAppButton>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
} 