'use client'

import { useAccount, useReadContract } from "wagmi";
import { redirect } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTRACT_ABI } from "../../utils/contract_abi";

export default function SolverIndex() {
    const { isConnected, address } = useAccount()

    const SHOPPING_INTENT_ESCROW_CONTRACT = {
      address: "0x6Eff10719fF6d40A5b4874B2244A97CAf768a150",
      abi: CONTRACT_ABI,
    };

    const { data } = useReadContract({
        abi: CONTRACT_ABI,
        address: SHOPPING_INTENT_ESCROW_CONTRACT.address,
        functionName: 'isSolverWhitelisted',
        args: [address],
        enabled: typeof window !== 'undefined',
    });

    if (isConnected) {
      console.log('isSolverWhitelisted: ', data)  
      if (data) {
        redirect("/solver/dashboard");
      }
    }

    // Option 1: Show a simple "Welcome" message
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        {/* 
          Outer container that takes up the full screen (min-h-screen)
          and uses flexbox to center contents both vertically and horizontally
        */}
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {/* The "login" card */}
          <div className="text-center">
            <h1 className="block text-2xl font-bold text-gray-800">
              Connect your Wallet
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Please connect your wallet to log in.
            </p>
          </div>

          <div className="grid grid-rows-2 mt-5 flex justify-center">
            {/* 
              Use the ConnectButton from RainbowKit. 
              This replaces traditional email/password fields.
            */}
            {isConnected && (
              <p className="block border bg-gray-300 text-sm mt-2 mb-5 dark:text-white">
                You must be whitelisted to be a solver
              </p>
            )}
            <ConnectButton />
          </div>

          <p className="mt-5 text-sm text-center text-gray-600">
            Don’t have a wallet yet?
            <a
              target="_blank"
              href="https://learn.rainbow.me/understanding-web3?utm_source=rainbowkit&utm_campaign=learnmore"
              className="text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium ml-1"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    );
  
    // Option 2: Programmatically redirect to /solver/dashboard
    // (Requires next/navigation or next/redirect usage in Next.js 13+)
    // import { redirect } from 'next/navigation'
    // redirect('/solver/dashboard');
  }  