'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/frame-sdk'
import { isMiniAppSafe } from '../utils/isMiniApp'
import MiniAppButton from './MiniAppButton'

/**
 * Component to add the MiniApp to the user's Farcaster client
 * This provides a button to prompt users to add this app to their client
 */
export default function AddToFarcaster({ onSuccess }) {
  const [isAlreadyAdded, setIsAlreadyAdded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isFarcasterContext, setIsFarcasterContext] = useState(false)

  useEffect(() => {
    setIsFarcasterContext(isMiniAppSafe())
  }, [])

  // Don't show in non-Farcaster context
  if (!isFarcasterContext) {
    return null
  }

  const handleAddToFarcaster = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Call the addFrame SDK method
      const result = await sdk.actions.addFrame()

      console.log('addFrame result:', result)
      setIsAlreadyAdded(true)

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(result)
      }
    } catch (err) {
      console.error('Error adding frame:', err)
      setError(err.message || 'Failed to add to Farcaster')
    } finally {
      setIsLoading(false)
    }
  }

  if (isAlreadyAdded) {
    return (
      <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm my-4">
        <p>This app has been added to your Farcaster client!</p>
      </div>
    )
  }

  return (
    <div className="my-4">
      <MiniAppButton
        onClick={handleAddToFarcaster}
        loading={isLoading}
        fullWidth
        type="primary"
      >
        Add to Farcaster
      </MiniAppButton>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 