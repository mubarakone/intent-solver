'use client'

import { useEffect, useState } from 'react'

/**
 * This component solves hydration issues by ensuring its children
 * are only rendered on the client side, never during server-side rendering.
 * Use this to wrap components that depend on browser-only APIs.
 */
export default function ClientOnly({ children }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // During server-side rendering and initial client render, render nothing
  if (!hasMounted) {
    return null
  }

  // Once mounted on client, render children
  return <>{children}</>
} 