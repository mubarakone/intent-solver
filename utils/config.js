'use client'

import { http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: '89f4afa5792527fe6f3255be3e031469',
    chains: [baseSepolia],
    transports: {
        // [base.id]: http(),
        [baseSepolia.id]: http(),
    },
    ssr: true, // If your dApp uses server side rendering (SSR)
});