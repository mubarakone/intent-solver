'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import AdaptiveWalletButton from '../../../components/AdaptiveWalletButton';
import { isMiniApp } from '../../../utils/isMiniApp';
import {
  Search,
  X,
  Bell,
  Activity,
  Menu,
  ChevronRight,
} from 'lucide-react';

import { Home, Hourglass, Settings as Gear } from 'lucide-react'

export default function Layout({ children }) {
  const [isFarcasterMiniApp, setIsFarcasterMiniApp] = useState(false);

  // Check if running as MiniApp
  useEffect(() => {
    setIsFarcasterMiniApp(isMiniApp());
  }, []);

  return (
    <>
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-[48] w-full bg-white border-b text-sm py-2.5 lg:ps-[260px]">
        <nav className="px-4 sm:px-6 flex basis-full items-center w-full mx-auto">
          <div className="me-5 lg:me-0 lg:hidden">
            {/* Logo */}
            <a className="flex-none rounded-xl text-xl inline-block font-semibold focus:outline-none focus:opacity-80" href="#" aria-label="Preline">
              Storerunner
            </a>
          </div>

          <div className="w-full flex items-center justify-end ms-auto lg:gap-x-3">
            <div className="ms-auto flex items-center gap-x-2 sm:gap-x-4">
              <button
                type="button"
                className="size-[38px] relative inline-flex justify-center items-center 
                           gap-x-2 text-sm font-semibold rounded-full border border-transparent 
                           text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 
                           disabled:opacity-50 disabled:pointer-events-none"
              >
                <Activity className="shrink-0 w-4 h-4" />
                <span className="sr-only">Activity</span>
              </button>

              {/* Use the adaptive approach for wallet connection */}
              {isFarcasterMiniApp ? (
                <AdaptiveWalletButton />
              ) : (
              <ConnectButton 
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
                showBalance={{
                  smallScreen: false,
                  largeScreen: true,
                }}
              />
              )}
            </div>
          </div>
        </nav>
      </header>
      {/* ========== END HEADER ========== */}

      {/* ========== MAIN CONTENT ========== */}
      <div className="w-full pt-10 px-4 sm:px-6 md:px-8 lg:ps-[260px]">
        {children}
      </div>
      {/* ========== END MAIN CONTENT ========== */}

      {/* ========== SIDEBAR ========== */}
      <div id="hs-application-sidebar" className="hs-overlay hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform hidden fixed top-0 start-0 bottom-0 z-[60] w-64 bg-white border-e border-gray-200 pt-7 pb-10 overflow-y-auto lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
        <div className="px-6">
          <a className="flex-none rounded-xl text-xl font-semibold focus:outline-none focus:opacity-80" href="#">
            Storerunner
      </a>
          </div>

        <nav className="p-6 w-full flex flex-col flex-wrap">
          <ul className="space-y-1.5">
            <li>
              <a className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-gray-100" href="/solver/dashboard">
                <Home className="w-4 h-4" />
                Home
              </a>
                </li>

            <li>
              <a className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-gray-100" href="#">
                <Hourglass className="w-4 h-4" />
                Pending Orders
              </a>
                </li>

            <li>
              <a className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-gray-100" href="#">
                <Gear className="w-4 h-4" />
                    Settings
              </a>
                </li>
              </ul>
            </nav>
          </div>
      {/* ========== END SIDEBAR ========== */}
    </>
  );
}