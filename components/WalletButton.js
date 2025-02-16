'use client'

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

export default function WalletButton({ onProceedToCheckout, isDisabled }) {
  const [clientConnected, setClientConnected] = useState(false);  
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    setClientConnected(isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (clientConnected && chain?.id !== baseSepolia.id) {
      switchChain({ chainId: baseSepolia.id });
    }
  }, [clientConnected, chain, switchChain]);

  const buttonClass = isDisabled
    ? "w-full bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded cursor-not-allowed"
    : "w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

  if (clientConnected) {
    return (
      <button onClick={onProceedToCheckout} disabled={isDisabled} className={buttonClass}>
        Proceed to Checkout ({address?.slice(0, 6)}...{address?.slice(-4)})
      </button>
    );
  }

  return <div className={isDisabled ? "pointer-events-none opacity-50" : ""}>
           <ConnectButton />
           {clientConnected && chain?.id !== baseSepolia.id && (
              <p style={{ color: 'red' }}>Please switch to Base Sepolia network.</p>
           )}
         </div>
    
}