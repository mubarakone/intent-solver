'use client'

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { isMiniAppSafe } from '../utils/isMiniApp';

/**
 * A wallet connect button that adapts to either MiniApp or standalone web app context
 * In MiniApp context, it uses the built-in Farcaster wallet connector
 * In standalone web app context, it uses RainbowKit
 */
export default function AdaptiveWalletButton({ 
  onProceedToCheckout, 
  isDisabled, 
  className,
  buttonText = "Connect Wallet",
  compact = false 
}) {
  const [isFarcasterMiniApp, setIsFarcasterMiniApp] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();
  
  // Check if running as MiniApp on client side
  useEffect(() => {
    setIsFarcasterMiniApp(isMiniAppSafe());
  }, []);

  // Automatically switch to Base Sepolia when connected
  useEffect(() => {
    if (isConnected && chain?.id !== baseSepolia.id) {
      console.log('Connected chain is not Base Sepolia, switching...');
      switchChain({ chainId: baseSepolia.id });
    }
  }, [isConnected, chain, switchChain]);

  // Display wrong network warning
  const isWrongNetwork = isConnected && chain?.id !== baseSepolia.id;

  // When proceed button is provided, show it when connected
  if (onProceedToCheckout && isConnected) {
    const buttonClass = isDisabled || isWrongNetwork
      ? "bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed"
      : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
    
    return (
      <div className={className || ''}>
        <button 
          onClick={onProceedToCheckout} 
          disabled={isDisabled || isWrongNetwork} 
          className={buttonClass}
        >
          Proceed to Checkout ({address?.slice(0, 6)}...{address?.slice(-4)})
        </button>
        {isWrongNetwork && (
          <p className="text-xs text-red-500 mt-1">Please switch to Base Sepolia network</p>
        )}
      </div>
    );
  }

  // In MiniApp context, use the Farcaster connector with simplified UI
  if (isFarcasterMiniApp) {
    // Connected state in MiniApp
    if (isConnected) {
      // Show network warning if on wrong network
      if (isWrongNetwork) {
        return (
          <div className={`${className || ''} flex flex-col items-center`}>
            <div className={`text-xs font-medium ${compact ? '' : 'mb-1'} text-yellow-600`}>
              {address?.slice(0, 4)}...{address?.slice(-2)}
            </div>
            {!compact && (
              <span className="text-xs text-red-500">Switch to Base Sepolia</span>
            )}
          </div>
        );
      }
      
      // Connected to correct network
      return compact ? (
        // Compact version for header
        <div className={`${className || ''} text-xs font-medium text-green-600`}>
          {address?.slice(0, 4)}...{address?.slice(-2)}
        </div>
      ) : (
        // Full version 
        <div className={`${className || ''} flex items-center gap-1`}>
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-sm font-medium">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
      );
    }
    
    // Not connected state in MiniApp
    return (
      <button 
        onClick={() => {
          // Find the Farcaster connector and connect with it
          const farcasterConnector = connectors.find(c => 
            c.name.toLowerCase().includes('farcaster') || 
            c.id.toLowerCase().includes('farcaster')
          );
          if (farcasterConnector) {
            connect({ connector: farcasterConnector });
          } else if (connectors.length > 0) {
            // Fallback to first connector if Farcaster one not found
            connect({ connector: connectors[0] });
          }
        }}
        className={`${compact ? 'text-xs py-1 px-2' : 'py-2 px-4'} bg-blue-500 hover:bg-blue-700 text-white font-bold rounded ${className || ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isDisabled}
      >
        {buttonText}
      </button>
    );
  }

  // In standalone web app context, use RainbowKit
  return (
    <div className={`${isDisabled ? 'opacity-50 pointer-events-none' : ''} ${className || ''}`}>
      <ConnectButton chainStatus={compact ? 'none' : 'full'} showBalance={!compact} />
    </div>
  );
} 