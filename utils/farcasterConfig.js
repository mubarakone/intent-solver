'use client'

import { http, createConfig } from 'wagmi'
import { base, mainnet, optimism, baseSepolia } from 'wagmi/chains'
import { farcasterFrame as farcasterConnector } from '@farcaster/frame-wagmi-connector'

/**
 * Create a Wagmi config for Farcaster MiniApp
 * 
 * NOTE: This config is meant to be used client-side only.
 * The miniAppConnector will not work in SSR context.
 */
export const farcasterConfig = createConfig({
  chains: [baseSepolia, base, mainnet, optimism],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
    [optimism.id]: http(),
  },
  connectors: [
    farcasterConnector()
  ]
}); 