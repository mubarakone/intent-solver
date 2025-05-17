'use client'

import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector'

/**
 * Create a Wagmi config for Farcaster MiniApp
 * 
 * NOTE: This config is meant to be used client-side only.
 * The miniAppConnector will not work in SSR context.
 */
export const farcasterConfig = createConfig({
  chains: [baseSepolia, base],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors: [
    miniAppConnector()
  ]
}); 