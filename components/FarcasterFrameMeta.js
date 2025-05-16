'use client'

import React from 'react'
import Head from 'next/head'

/**
 * Component to add Farcaster Frame meta tags to make the app shareable in Farcaster feeds
 * This enables the app to be embedded as a Frame and shared in Farcaster client feeds
 */
export default function FarcasterFrameMeta({
  title = 'Storerunner',
  description = 'Order from your favorite ecommerce platforms directly onchain without having to move any funds.',
  imageUrl = 'https://storerunner.xyz/sharing-image.png', // Replace with your actual image URL
  appUrl = 'https://storerunner.xyz' // Replace with your actual app URL
}) {
  // Create the Frame embed JSON that follows the Farcaster spec
  const frameEmbed = {
    version: 'vNext',
    image: imageUrl,
    buttons: [
      {
        label: 'Open Storerunner',
        action: 'post_redirect'
      }
    ],
    post_url: `${appUrl}/api/farcaster/frame`,
    aspect_ratio: '1.91:1'
  }

  return (
    <Head>
      {/* Farcaster Frame meta tag */}
      <meta name="fc:frame" content={JSON.stringify(frameEmbed)} />
      <meta name="fc:frame:image" content={imageUrl} />
      <meta name="fc:frame:button:1" content="Open Storerunner" />
      <meta name="fc:frame:post_url" content={`${appUrl}/api/farcaster/frame`} />
      
      {/* Standard Open Graph tags for other platforms */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={appUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  )
} 