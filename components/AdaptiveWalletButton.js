'use client'

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { isMiniApp } from '../utils/isMiniApp';

/**
 * A wallet connect button that adapts to either MiniApp or standalone web app context
 * In MiniApp context, it uses the built-in wallet connector
 * In standalone web app context, it uses RainbowKit
 */
export default function AdaptiveWalletButton({ onProceedToCheckout, isDisabled, className }) {
  const [clientConnected, setClientConnected] = useState(false);  
  const [isFarcasterMiniApp, setIsFarcasterMiniApp] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();

  // Check if running as MiniApp
  useEffect(() => {
    setIsFarcasterMiniApp(isMiniApp());
  }, []);

  // Update client connected state
  useEffect(() => {
    setClientConnected(isConnected);
  }, [isConnected]);

  // Handle chain switching
  useEffect(() => {
    if (clientConnected && chain?.id !== baseSepolia.id) {
      switchChain({ chainId: baseSepolia.id });
    }
  }, [clientConnected, chain, switchChain]);

  const buttonClass = isDisabled
    ? "w-full bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed"
    : "w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

  // If connected, show proceed button
  if (clientConnected) {
    return (
      <button onClick={onProceedToCheckout} disabled={isDisabled} className={buttonClass}>
        Proceed to Checkout ({address?.slice(0, 6)}...{address?.slice(-4)})
      </button>
    );
  }

  // In MiniApp context, use the Farcaster connector
  if (isFarcasterMiniApp) {
    return (
      <div className={isDisabled ? "pointer-events-none opacity-50" : ""}>
        <button 
          onClick={() => connect({ connector: connectors[0] })}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
        {clientConnected && chain?.id !== baseSepolia.id && (
          <p style={{ color: 'red' }}>Please switch to Base Sepolia network.</p>
        )}
      </div>
    );
  }

  // In standalone web app context, use RainbowKit
  return (
    <div className={isDisabled ? "pointer-events-none opacity-50" : ""}>
      <ConnectButton />
      {clientConnected && chain?.id !== baseSepolia.id && (
        <p style={{ color: 'red' }}>Please switch to Base Sepolia network.</p>
      )}
    </div>
  );
} 