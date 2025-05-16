'use client'
import React, { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Menu } from 'lucide-react';
import { isMiniAppSafe } from '../utils/isMiniApp';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import Home from './Home'
import History from './History';

// Dynamically import the Frame meta component to avoid SSR issues
const FarcasterFrameMeta = dynamic(() => import('../components/FarcasterFrameMeta'), { ssr: false });

// Create the Farcaster Frame meta content
const frameEmbed = {
  version: 'vNext',
  image: 'https://storerunner.xyz/sharing-image.png',
  buttons: [
    {
      label: 'Open Storerunner',
      action: 'post_redirect'
    }
  ],
  post_url: 'https://storerunner.xyz/api/farcaster/frame',
  aspect_ratio: '1.91:1'
};

export default function page() {
  const [activeTab, setActiveTab] = useState('Home');
  const [clientConnected, setClientConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFarcasterMiniApp, setIsFarcasterMiniApp] = useState(false);

  const { isConnected } = useAccount();

  useEffect(() => {
    setClientConnected(isConnected);
  }, [isConnected]);

  // Check if running as MiniApp
  useEffect(() => {
    setIsFarcasterMiniApp(isMiniAppSafe());
  }, []);

  const renderTab = () => {
    switch(activeTab) {
      case 'Home':
        return <Home />;
      case 'History':
        return <History />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      {/* Add Farcaster Frame meta tags */}
      <Head>
        <meta name="fc:frame" content={JSON.stringify(frameEmbed)} />
        <meta name="fc:frame:image" content="https://storerunner.xyz/sharing-image.png" />
        <meta name="fc:frame:button:1" content="Open Storerunner" />
        <meta name="fc:frame:post_url" content="https://storerunner.xyz/api/farcaster/frame" />
      </Head>
      
      <main className="min-h-screen flex flex-col bg-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Header with mobile optimization */}
        <div className="relative flex flex-col sm:flex-row items-center py-4 mb-4 sm:mb-6">
          {/* Heading - centered on mobile, left-aligned on larger screens */}
          <h1 className="text-3xl sm:text-4xl font-bold mx-auto sm:mx-0">
            Storerunner
          </h1>

          {/* Only show the connect button in standalone web app context */}
          {clientConnected && !isFarcasterMiniApp && (
            <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:absolute sm:right-4">
              <ConnectButton />
            </div>
          )}
        </div>

        {/* Content wrapper with flex layout */}
        <div className="flex-1 flex flex-col">
          {renderTab()}
        </div>

        {/* Tab navigation at the bottom of the screen */}
        <div className="fixed bottom-0 inset-x-0 flex justify-around bg-white border-t border-gray-200 p-2 sm:p-3 shadow-lg">
          <button
            onClick={() => setActiveTab('Home')}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-md ${
              activeTab === 'Home' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <span className="text-sm">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('History')}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-md ${
              activeTab === 'History' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <span className="text-sm">History</span>
          </button>
        </div>
      </main>
    </>
  )
}
