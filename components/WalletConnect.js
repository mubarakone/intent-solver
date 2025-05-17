'use client'

import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect } from 'wagmi';
import { isMiniAppSafe } from '../utils/isMiniApp';

/**
 * Smart wallet connection component that adapts based on environment
 * - In standalone web app: Shows RainbowKit ConnectButton
 * - In Farcaster MiniApp: Shows custom button that connects to Farcaster wallet
 */
export default function WalletConnect({ className = '' }) {
  const [isFarcasterMiniApp, setIsFarcasterMiniApp] = useState(false);
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  // Detect environment on component mount
  useEffect(() => {
    setIsFarcasterMiniApp(isMiniAppSafe());
  }, []);

  // Handle Farcaster wallet connection
  const handleFarcasterConnect = () => {
    // Find the Farcaster connector (should be the first one when in MiniApp)
    const farcasterConnector = connectors[0];
    if (farcasterConnector) {
      connect({ connector: farcasterConnector });
    }
  };

  // In Farcaster MiniApp environment
  if (isFarcasterMiniApp) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        {isConnected ? (
          <div className="flex flex-col items-center text-sm">
            <span className="font-medium text-green-600">Wallet Connected</span>
            <span className="text-xs text-gray-600 mt-1">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        ) : (
          <button
            onClick={handleFarcasterConnect}
            className="bg-purple-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Connect Farcaster Wallet
          </button>
        )}
      </div>
    );
  }

  // In standalone web app environment
  return (
    <div className={className}>
      <ConnectButton />
    </div>
  );
} 