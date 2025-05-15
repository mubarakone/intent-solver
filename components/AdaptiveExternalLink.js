'use client'

import React from 'react'
import { openUrl } from '../utils/farcasterActions'

/**
 * A link component that handles external links appropriately in both MiniApp and standalone contexts
 * In MiniApp context, it uses the Farcaster SDK to open URLs externally
 * In standalone context, it uses regular anchor tags
 */
export default function AdaptiveExternalLink({
  href,
  children,
  className = '',
  closeAfter = false,
  ...props
}) {
  // Handle click for both contexts
  const handleClick = async (e) => {
    e.preventDefault()
    await openUrl(href, closeAfter)
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  )
} 