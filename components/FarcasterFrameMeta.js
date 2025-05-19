'use client'

import React, { useEffect } from 'react'

/**
 * Client-side only component that adds Farcaster Frame meta tags
 * This avoids hydration errors by only adding them on the client side
 */
export default function FarcasterFrameMeta({ frameData }) {
  useEffect(() => {
    if (!frameData) return;
    
    // Add meta tags to head
    const metaTags = [
      { name: 'fc:frame', content: JSON.stringify(frameData) },
      { name: 'fc:frame:image', content: frameData.image },
      { name: 'fc:frame:button:1', content: frameData.buttons[0].label },
      { name: 'fc:frame:post_url', content: frameData.post_url }
    ];
    
    // Create and append meta tags
    const head = document.head;
    const existingTags = {};
    
    // Remove existing tags first to avoid duplicates
    document.querySelectorAll('meta[name^="fc:frame"]').forEach(tag => {
      tag.remove();
    });
    
    // Add new tags
    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.name = tag.name;
      meta.content = tag.content;
      head.appendChild(meta);
    });
    
    // Cleanup on unmount
    return () => {
      document.querySelectorAll('meta[name^="fc:frame"]').forEach(tag => {
        tag.remove();
      });
    };
  }, [frameData]);
  
  // This component doesn't render anything visible
  return null;
} 