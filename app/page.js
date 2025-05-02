'use client'
import React, { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Menu } from 'lucide-react';

import Home from './Home'
import History from './History';

export default function page() {
  const [activeTab, setActiveTab] = useState('Home');
  const [clientConnected, setClientConnected] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <main className="min-h-screen flex flex-col bg-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Header with mobile optimization */}
      <div className="relative flex flex-col sm:flex-row items-center py-4 mb-4 sm:mb-6">
        {/* Heading - centered on mobile, left-aligned on larger screens */}
        <h1 className="text-3xl sm:text-4xl font-bold mx-auto sm:mx-0">
          Storerunner
        </h1>

        {/* Button - full width on mobile, positioned right on larger screens */}
        {clientConnected && (
          <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:absolute sm:right-4">
            <ConnectButton />
          </div>
        )}
      </div>

      {/* Content wrapper with flex layout */}
      <div className="flex flex-col flex-grow">
        {/* Mobile-friendly tabs navigation */}
        <div className="border-b border-gray-200">
          <nav
            className="flex gap-x-1 overflow-x-auto hide-scrollbar"
            aria-label="Tabs"
            role="tablist"
            aria-orientation="horizontal"
          >
            {/* Tab 1 button: "Home" */}
            <button
              type="button"
              className={`
                min-w-0 flex-1 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium text-center 
                border-b-2 
                ${
                  activeTab === "Home"
                    ? // Active tab styles
                      "border-blue-600 text-blue-600 bg-white"
                    : // Inactive tab styles
                      "border-transparent text-gray-500 hover:text-gray-700 bg-gray-50"
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

            {/* Tab 2 button: History */}
            <button
              type="button"
              className={`
                min-w-0 flex-1 py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium text-center 
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

        {/* Tab content */}
        <div className="mt-4 sm:mt-6">{renderTab()}</div>
        
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
  );
}
