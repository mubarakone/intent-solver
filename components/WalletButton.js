'use client'

import AdaptiveWalletButton from './AdaptiveWalletButton';

// This wrapper component maintains backward compatibility with existing usage
export default function WalletButton({ onProceedToCheckout, isDisabled }) {
  return (
    <AdaptiveWalletButton 
      onProceedToCheckout={onProceedToCheckout} 
      isDisabled={isDisabled} 
    />
  );
}