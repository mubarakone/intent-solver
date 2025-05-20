'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from 'wagmi'
import { config } from "../utils/config";
import { farcasterConfig } from "../utils/farcasterConfig";
import '@rainbow-me/rainbowkit/styles.css'; // Import RainbowKit styles
import Script from "next/script";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';

// Dynamically import components that should only run on the client
const FarcasterInit = dynamic(() => import('../components/FarcasterInit'), { ssr: false });
const MiniAppLayout = dynamic(() => import('../components/MiniAppLayout'), { ssr: false });
const InstallPWA = dynamic(() => import('../components/InstallPWA'), { ssr: false });
const ClientOnly = dynamic(() => import('../components/ClientOnly'), { ssr: false });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Create a client-side only QueryClient to avoid hydration issues
const getQueryClient = () => new QueryClient();

// Component to handle theme initialization
function ThemeInitScript() {
  useEffect(() => {
    // This will run only once on the client side
    function applyTheme() {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDark ? 'dark' : 'light';
      
      // Force remove and add the theme class to ensure proper application
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      
      // Apply dark mode to the entire document by adding/removing class from html element
      if (theme === 'dark') {
        document.documentElement.style.colorScheme = 'dark';
        document.body.classList.add('dark-mode');
      } else {
        document.documentElement.style.colorScheme = 'light';
        document.body.classList.remove('dark-mode');
      }
    }
    
    // Apply theme immediately
    applyTheme();
    
    // Listen for changes in color scheme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);
    
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, []);
  
  return null;
}

export default function RootLayout({ children }) {
  // Create query client only on the client side
  const [queryClient] = useState(() => getQueryClient());

  // Get initial color scheme preference for server rendering
  // This won't be 100% accurate but will be replaced by client-side logic
  const systemPrefersDark = false; // Default to light for SSR
  const initialTheme = systemPrefersDark ? 'dark' : 'light';

  return (
    <html lang="en" className={`antialiased ${initialTheme}`} data-theme={initialTheme} style={{colorScheme: initialTheme}}>
      <head>
        <title>Storerunner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
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
        <link rel="apple-touch-icon" href="/icons/storerunner-icon.png?v=1" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/storerunner-icon.png?v=1" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/storerunner-icon.png?v=1" />
        <link rel="icon" href="/favicon.ico?v=1" />
        <link rel="shortcut icon" href="/icons/storerunner-icon.png?v=1" />
        <link rel="mask-icon" href="/icons/storerunner-icon.png?v=1" color="#5bbad5" />
        <meta name="msapplication-TileImage" content="/icons/storerunner-icon.png?v=1" />
        
        {/* Cache busting script */}
        <Script 
          src="/clear-cache.js?v=1" 
          strategy="beforeInteractive" 
        />
        
        {/* Load our dedicated Farcaster SDK handling script */}
        <Script 
          src="/farcaster-sdk.js" 
          strategy="afterInteractive"
        />
        
        {/* Load the Farcaster SDK package itself */}
        <Script 
          src="https://esm.sh/@farcaster/frame-sdk" 
          strategy="afterInteractive"
          type="module"
        />
        
        {/* Force dark mode styles */}
        <Script
          id="dark-mode-force-style"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Check if dark mode is preferred
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  // Create and append a style element with force overrides for dark mode
                  const style = document.createElement('style');
                  style.textContent = \`
                    html.dark, body.dark-mode {
                      background-color: #0a0a0a !important;
                      color: #ffffff !important;
                    }
                    .dark .bg-white {
                      background-color: #111827 !important;
                    }
                    .dark .bg-gray-100, .dark .bg-gray-50 {
                      background-color: #000000 !important;
                    }
                    .dark input, .dark select, .dark textarea {
                      background-color: #374151 !important;
                      color: #ffffff !important;
                      border-color: #4b5563 !important;
                    }
                    /* Only make dark text white, not all text */
                    .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
                      color: #ffffff !important;
                    }
                    /* Target specific dark text classes */
                    .dark .text-gray-700, .dark .text-gray-800, .dark .text-gray-900 {
                      color: #ffffff !important;
                    }
                    /* Keep lighter grays as is but brighten slightly for contrast */
                    .dark .text-gray-500, .dark .text-gray-600 {
                      color: #d1d5db !important;
                    }
                  \`;
                  document.head.appendChild(style);
                  document.documentElement.classList.add('dark');
                  document.body.classList.add('dark-mode');
                }
              })();
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientOnly>
          <ThemeInitScript />
          <QueryClientProvider client={queryClient}>
            <WagmiProviders>
              {children}
            </WagmiProviders>
          </QueryClientProvider>
        </ClientOnly>
      </body>
    </html>
  );
}

// Wrapper component for handling platform-specific providers
function WagmiProviders({ children }) {
  const [isFarcasterMiniApp, setIsFarcasterMiniApp] = useState(false);
  
  useEffect(() => {
    // Only import and use on client
    import('../utils/isMiniApp').then(({ isMiniAppSafe }) => {
      setIsFarcasterMiniApp(isMiniAppSafe());
    });
  }, []);

  if (isFarcasterMiniApp) {
    return (
      <WagmiProvider config={farcasterConfig}>
        <FarcasterInit />
        <MiniAppLayout>{children}</MiniAppLayout>
      </WagmiProvider>
    );
  }

  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        {children}
        <InstallPWA />
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
