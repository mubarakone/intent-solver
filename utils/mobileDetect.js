import React, { useState, useEffect } from 'react';

/**
 * Utility to detect if the current device is a mobile device
 * This is used for conditional rendering in components
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for common mobile user agent patterns
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  return (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent) ||
    // Check viewport width as an additional signal
    window.innerWidth < 640
  );
};

/**
 * A React hook that provides isMobile() with window resize listener
 * @returns {boolean} Whether the current device is a mobile device
 */
export const useMobileDetect = () => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(isMobile());
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  return isMobileDevice;
}; 