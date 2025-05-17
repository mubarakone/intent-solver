'use client'

import React, { useState } from 'react';
import { Home, History as HistoryIcon, X, Share } from 'lucide-react';
import { closeMiniApp } from '../utils/farcasterActions';
import AdaptiveWalletButton from './AdaptiveWalletButton';
import dynamic from 'next/dynamic';

// Dynamically import the sharing component to avoid SSR issues
const ShareToFarcaster = dynamic(() => import('./ShareToFarcaster'), { ssr: false });

/**
 * A simplified layout optimized for MiniApp context
 * This layout is designed to be more compact and touch-friendly
 */
export default function MiniAppLayout({ children, currentPage = 'home' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleShareMenu = () => {
    setIsShareMenuOpen(!isShareMenuOpen);
  };

  const handleClose = async () => {
    await closeMiniApp();
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Compact header for MiniApp */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">Storerunner</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleShareMenu}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Share"
          >
            <Share className="w-5 h-5 text-gray-500" />
          </button>
          <AdaptiveWalletButton />
          <button 
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      {/* Share menu - conditionally rendered */}
      {isShareMenuOpen && (
        <div className="absolute top-12 right-4 bg-white shadow-lg rounded-lg p-3 z-50 border border-gray-200">
          <div className="flex flex-col gap-2">
            <ShareToFarcaster
              text="Check out Storerunner! Shop onchain without moving funds:"
              onSuccess={() => setIsShareMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content area - simplified for MiniApp */}
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>

      {/* Bottom navigation - more compact for MiniApp */}
      <nav className="bg-white border-t border-gray-200 px-2 py-2">
        <div className="flex justify-around">
          <a 
            href="/"
            className={`flex flex-col items-center p-2 rounded-md ${currentPage === 'home' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
          
          <a 
            href="/history"
            className={`flex flex-col items-center p-2 rounded-md ${currentPage === 'history' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="text-xs mt-1">History</span>
          </a>
        </div>
      </nav>
    </div>
  );
} 