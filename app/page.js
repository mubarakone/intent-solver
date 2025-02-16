'use client'
import React, { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

import Home from './Home'
import History from './History';

export default function page() {
  const [activeTab, setActiveTab] = useState('Home');
  const [clientConnected, setClientConnected] = useState(false);

  const { isConnected } = useAccount();

  useEffect(() => {
    setClientConnected(isConnected);
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
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative flex items-center py-4">
        {/* Heading in the center */}
        <h1 className="text-4xl font-bold mx-auto">Storerunner</h1>

        {/* Button on the right (absolutely positioned) */}
        {clientConnected && (
          <div className="absolute right-4">
            <ConnectButton />
          </div>
        )}
      </div>

      {/* 
        Preline Tabs 
        Make sure you have imported Preline's JS so data-hs-tab works:
        e.g., import "preline" in your root layout or a global script.
      */}
      <div className="border-b border-gray-200">
        <nav
          className="flex gap-x-1"
          aria-label="Tabs"
          role="tablist"
          aria-orientation="horizontal"
        >
          {/* Tab 1 button: "Home" */}
          <button
            type="button"
            className={`
              py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium text-center 
              border-b-2 
              ${
                activeTab === "Home"
                  ? // Active tab styles
                    "border-blue-600 text-blue-600 bg-white"
                  : // Inactive tab styles
                    "border-transparent text-gray-500 hover:text-gray-700 bg-gray-50"
              } 
              // Some rounding on top corners (if you like)
              rounded-t-lg
              focus:outline-none
            `}
            id="card-type-tab-item-1"
            aria-selected="true"
            data-hs-tab="#card-type-tab-preview"
            aria-controls="card-type-tab-preview"
            role="tab"
            onClick={() => setActiveTab("Home")}
          >
            Home
          </button>

          {/* Tab 2 button: a future page placeholder */}
          <button
            type="button"
            className={`
              py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium text-center 
              border-b-2
              ${
                activeTab === "History"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 bg-gray-50"
              }
              rounded-t-lg
              focus:outline-none
            `}
            id="card-type-tab-item-2"
            aria-selected="false"
            data-hs-tab="#card-type-tab-2"
            aria-controls="card-type-tab-2"
            role="tab"
            onClick={() => setActiveTab("History")}
          >
            History
          </button>
        </nav>
      </div>

      <div className="">{renderTab()}</div>
    </main>
  );
}
