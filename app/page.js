'use client';

import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import dynamic from 'next/dynamic';

import Home from './Home';
import History from './History';

// Dynamically import components that need client-side only execution
const FarcasterFrameMeta = dynamic(() => import('../components/FarcasterFrameMeta'), { ssr: false });
const ClientOnly = dynamic(() => import('../components/ClientOnly'), { ssr: false });

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

export default function Page() {
  const [activeTab, setActiveTab] = useState('Home');
  const [clientConnected, setClientConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFarcasterMiniApp, setIsFarcasterMiniApp] = useState(false);

  const { isConnected } = useAccount();

  useEffect(() => {
    setClientConnected(isConnected);
    
    // Only import and use on client
    import('../utils/isMiniApp').then(({ isMiniAppSafe }) => {
      setIsFarcasterMiniApp(isMiniAppSafe());
    });
  }, [isConnected]);

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
      <ClientOnly>
        <FarcasterFrameMeta frameData={frameEmbed} />
      </ClientOnly>

      <main className="min-h-screen flex flex-col bg-gray-100 dark:!bg-black py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Header with mobile optimization */}
        <div className="relative flex flex-col sm:flex-row items-center py-4 mb-4 sm:mb-6">
          {/* Heading - centered on mobile, left-aligned on larger screens */}
          <h1 className="text-3xl sm:text-4xl font-bold mx-auto sm:mx-0 dark:!text-white">
            Storerunner
          </h1>

          {/* Only show the connect button in standalone web app context */}
          <ClientOnly>
            {clientConnected && !isFarcasterMiniApp && (
              <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:absolute sm:right-4">
                <ConnectButton />
              </div>
            )}
          </ClientOnly>
        </div>

        {/* Content wrapper with flex layout */}
        <div className="flex flex-col flex-grow">
          {/* Mobile-friendly tabs navigation - now sticky */}
          <div className="sticky top-0 z-10 bg-gray-100 dark:!bg-black -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <div className="border-b border-gray-200">
              <nav
                className="flex gap-x-1 overflow-x-auto hide-scrollbar"
                aria-label="Tabs"
                role="tablist"
                aria-orientation="horizontal"
              >
                {/* Tab buttons remain unchanged */}
                <button
                  type="button"
                  className={`
                  min-w-0 flex-1 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium text-center 
                  border-b-2 
                  ${
                    activeTab === "Home"
                      ? "border-blue-600 text-blue-600 bg-white dark:!bg-gray-800"
                      : "border-transparent text-gray-500 hover:text-gray-700 bg-gray-50 dark:!bg-gray-900 dark:hover:!bg-gray-800"
                  } 
                  rounded-t-lg
                  focus:outline-none
                `}
                  id="card-type-tab-item-1"
                  aria-selected={activeTab === "Home"}
                  data-hs-tab="#card-type-tab-preview"
                  aria-controls="card-type-tab-preview"
                  role="tab"
                  onClick={() => setActiveTab("Home")}
                >
                  Home
                </button>

                <button
                  type="button"
                  className={`
                  min-w-0 flex-1 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium text-center 
                  border-b-2
                  ${
                    activeTab === "History"
                      ? "border-blue-600 text-blue-600 bg-white dark:!bg-gray-800"
                      : "border-transparent text-gray-500 hover:text-gray-700 bg-gray-50 dark:!bg-gray-900 dark:hover:!bg-gray-800"
                  }
                  rounded-t-lg
                  focus:outline-none
                `}
                  id="card-type-tab-item-2"
                  aria-selected={activeTab === "History"}
                  data-hs-tab="#card-type-tab-2"
                  aria-controls="card-type-tab-2"
                  role="tab"
                  onClick={() => setActiveTab("History")}
                >
                  History
                </button>
              </nav>
            </div>
          </div>

          {/* Tab content with padding to account for sticky header */}
          <div className="mt-4 sm:mt-6 flex-grow">{renderTab()}</div>

          {/* Solver link always appears directly below tab content */}
          <div className="mt-6 sm:mt-8 text-center">
            <a
              href="/solver"
              className="text-blue-500 hover:text-blue-700 text-sm sm:text-base"
            >
              Are you a Solver? Log In Here
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
