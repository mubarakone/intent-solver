'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from 'wagmi'
import { config } from "../utils/config";
import { farcasterConfig } from "../utils/farcasterConfig";
import { isMiniAppSafe } from "../utils/isMiniApp";
import dynamic from 'next/dynamic';
import '@rainbow-me/rainbowkit/styles.css'; // Import RainbowKit styles
import InstallPWA from '../components/InstallPWA';
import { useEffect, useState } from "react";
import Script from "next/script";

// Dynamically import components that should only run on the client
const FarcasterInit = dynamic(() => import('../components/FarcasterInit'), { ssr: false });
const MiniAppLayout = dynamic(() => import('../components/MiniAppLayout'), { ssr: false });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata = {
  title: "Storerunner",
  description: "Order from your favorite ecommerce platforms directly onchain without having to move any funds.",
};

// Create a client-side only QueryClient to avoid hydration issues
const getQueryClient = () => new QueryClient();

export default function RootLayout({ children }) {
  // State to track if we're in a MiniApp environment
  const [isFarcasterMiniApp, setIsFarcasterMiniApp] = useState(false);
  // Create query client only on the client side
  const [queryClient] = useState(() => getQueryClient());

  // Determine if running as MiniApp on client-side
  useEffect(() => {
    setIsFarcasterMiniApp(isMiniAppSafe());
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#f3f4f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Storerunner" />
        <meta name="apple-mobile-web-app-title" content="Storerunner" />
        <meta name="description" content="Order from your favorite ecommerce platforms directly onchain without having to move any funds." />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#f3f4f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/storerunner-icon.png" />
        <link rel="icon" href="/icons/storerunner-icon.png" />
        <link rel="shortcut icon" href="/icons/storerunner-icon.png" />
        
        {/* Load Farcaster SDK script in a way that won't block SSR */}
        <Script 
          src="https://esm.sh/@farcaster/frame-sdk" 
          strategy="afterInteractive"
          type="module"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Use the appropriate Wagmi provider based on environment */}
        <WagmiProvider config={isFarcasterMiniApp ? farcasterConfig : config}>
          <QueryClientProvider client={queryClient}>
            {/* In MiniApp context, we don't need RainbowKitProvider */}
            {isFarcasterMiniApp ? (
              <>
                <FarcasterInit />
                {/* Use optimized MiniApp layout in Farcaster context */}
                <MiniAppLayout>
                  {children}
                </MiniAppLayout>
              </>
            ) : (
              <RainbowKitProvider>
                {children}
                <InstallPWA />
              </RainbowKitProvider>
            )}
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
