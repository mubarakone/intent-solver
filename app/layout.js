'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from 'wagmi'
import { config } from "../utils/config";
import '@rainbow-me/rainbowkit/styles.css'; // Import RainbowKit styles
import InstallPWA from '../components/InstallPWA';

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

const queryClient = new QueryClient()

export default function RootLayout({ children }) {
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              {children}
              <InstallPWA />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
