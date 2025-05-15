'use client'

import React, { useEffect, useState } from 'react'
import { isMiniAppSafe } from '../utils/isMiniApp'

/**
 * A container component that adapts to MiniApp dimensions
 * This ensures content is properly sized for the MiniApp modal context
 */
export default function MiniAppResponsiveContainer({ 
  children, 
  className = '',
  disablePadding = false,
  centerContent = false 
}) {
  const [isFarcasterMiniApp, setIsFarcasterMiniApp] = useState(false)
  
  useEffect(() => {
    setIsFarcasterMiniApp(isMiniAppSafe())
  }, [])

  // Base styles
  const baseStyles = disablePadding ? '' : 'p-4'
  const centerStyles = centerContent ? 'flex flex-col items-center justify-center' : ''
  
  // Apply different styles based on context
  const containerStyles = isFarcasterMiniApp 
    ? `${baseStyles} ${centerStyles} max-w-full overflow-x-hidden ${className}` 
    : `${baseStyles} ${centerStyles} max-w-4xl mx-auto ${className}`

  return (
    <div className={containerStyles}>
      {children}
    </div>
  )
} 