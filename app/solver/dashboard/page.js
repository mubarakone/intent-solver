'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useReadContracts, useWatchContractEvent, useWriteContract } from 'wagmi';
import { parseAbiItem, decodeEventLog, parseEther, parseAbi } from 'viem';
import { keccak256, toHex } from 'viem';
import { ReclaimProofRequest, verifyProof } from '@reclaimprotocol/js-sdk';
import { client } from '../../../utils/viemConfig';

import IntentTable from '../../../components/IntentTable';
import ProofModal from '../../../components/ProofModal';

import { CONTRACT_ABI } from '../../../utils/contract_abi';

export default function SolverDashboard() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [intentCreatedEvents, setIntentCreatedEvents] = useState([]);
  const [fulfilledStatuses, setFulfilledStatuses] = useState({});
  const [remainingTimes, setRemainingTimes] = useState({});
  const [clientConnected, setClientConnected] = useState(false);
  const [requestUrl, setRequestUrl] = useState('');
  const [proofs, setProofs] = useState();
  const [isClient, setIsClient] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [activeModal, setActiveModal] = useState("Idle")

  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();

  const { writeContractAsync } = useWriteContract({
    enabled: isClient,
  });

  // Reclaim credentials
  const APP_ID = '0xcf3F46e591bD71d21685F206A02DD7a78510de00';
  const APP_SECRET = '0x5b1ed296b7c605d0c43d574bbc22153c598bf2f643f14bb132d8001358c2e312';
  const PROVIDER_ID = '1b554fcc-7c9d-4291-84f6-6f73ddeda92f';

  const SHOPPING_INTENT_ESCROW_CONTRACT = {
    address: '0x6Eff10719fF6d40A5b4874B2244A97CAf768a150',
    abi: CONTRACT_ABI,
  };

  const ethUsdRate = 3050; // USD price of 1 ETH

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setClientConnected(isConnected);
  }, [isConnected]);

  // Fetch Past Events on Mount
  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        const logs = await publicClient.getLogs({
          address: SHOPPING_INTENT_ESCROW_CONTRACT.address,
          event: parseAbiItem(
            'event IntentCreated(uint256 indexed intentId, address indexed buyer, uint256 deposit, bytes32 hashedProductLink, bytes32 hashedShippingAddr, uint256 deadline)'
          ),
          fromBlock: 'earliest',
        });

        const decodedEvents = await Promise.all(
          logs.map(async (log) => {
            const { args } = decodeEventLog({
              abi: CONTRACT_ABI,
              data: log.data,
              topics: log.topics,
            });

            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            const eventTimestamp = new Date(Number(block.timestamp) * 1000).toLocaleString();

            return {
              intentId: Number(args.intentId),
              buyer: args.buyer,
              deposit: Number(args.deposit),
              hashedProductLink: args.hashedProductLink,
              hashedShippingAddr: args.hashedShippingAddr,
              deadline: new Date(Number(args.deadline) * 1000).toLocaleString(),
              transactionHash: log.transactionHash,
              createdAt: eventTimestamp,
            };
          })
        );

        console.log('Final Decoded Events:', decodedEvents);
        setIntentCreatedEvents(decodedEvents);
        setIsTableLoading(false);
      } catch (error) {
        console.error('Error fetching past events:', error);
      }
    };

    fetchPastEvents();
  }, [publicClient]);

  // Calculate Remaining Time
  useEffect(() => {
    if (intentCreatedEvents.length === 0) return;

    const timestamps = {};
    intentCreatedEvents.forEach((intent) => {
      timestamps[intent.intentId] = getRemainingTime(intent.deadline);
    });

    setRemainingTimes(timestamps);
  }, [intentCreatedEvents]);

  // Watch contract for new events
  useWatchContractEvent({
    address: SHOPPING_INTENT_ESCROW_CONTRACT.address,
    abi: CONTRACT_ABI,
    eventName: 'IntentCreated',
    enabled: clientConnected,
    onLogs: (logs) => {
      console.log('Live Event Logs:', logs);

      const newEvents = logs.map((log) => {
        const { args } = decodeEventLog({
          abi: CONTRACT_ABI,
          data: log.data,
          topics: log.topics,
        });

        return {
          intentId: Number(args.intentId),
          buyer: args.buyer,
          deposit: Number(args.deposit),
          hashedProductLink: args.hashedProductLink,
          hashedShippingAddr: args.hashedShippingAddr,
          deadline: new Date(Number(args.deadline) * 1000).toLocaleString(),
          transactionHash: log.transactionHash,
        };
      });

      console.log('Processed Live Events:', newEvents);
      setIntentCreatedEvents((prev) => [...prev, ...newEvents]);
      setIsTableLoading(false);
    },
  });

  // Read fulfillment status
  const { data } = useReadContracts({
    contracts: intentCreatedEvents.map((intent) => ({
      ...SHOPPING_INTENT_ESCROW_CONTRACT,
      functionName: 'intents',
      args: [intent.intentId],
      enabled: typeof window !== 'undefined',
    })),
  });

  // Update Fulfilled Status
  useEffect(() => {
    if (!data || !intentCreatedEvents.length) return;

    const statuses = {};
    intentCreatedEvents.forEach((intent, index) => {
      if (!data[index]?.result || !Array.isArray(data[index].result)) {
        console.warn('Invalid data for intent:', intent.intentId, data[index]);
        return;
      }
      const fulfilled = data[index].result[5] ?? false;
      statuses[intent.intentId] = fulfilled;
    });

    setFulfilledStatuses((prev) => ({ ...prev, ...statuses }));
  }, [data, intentCreatedEvents]);

  // Helper for deadlines
  const getRemainingTime = (deadline) => {
    const now = Date.now();
    const deadlineTime = new Date(deadline).getTime();
    const timeLeft = deadlineTime - now;
    if (timeLeft <= 0) return 'Expired';

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const publishSolver = async () => {
    const { deliveryDate, productLink } = proofs;

    try {
      console.log('Publishing solver data...');
      const res = await fetch('/api/intents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intentId: Number(intentId),
          solver: {
            walletAddress: address,
            deliveryDate,
          }
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Publish failed');
      console.log('Solver data published successfully!');
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  };

  const handleSimulateWrite = async (args) => {
    const abi = parseAbi([
        'function submitProof(uint256 _intentId, bytes32 _solverHashedProductLink, bytes32 _solverHashedShippingAddr, uint256 _finalPrice)'
    ]);
      

    try {
        const { results } = await publicClient.simulateContract({
            address: '0x6Eff10719fF6d40A5b4874B2244A97CAf768a150',
            abi: abi,
            functionName: 'submitProof',
            args: args,
            account: '0x0BC58805c5e5B1b020AfE6013Eeb6BcDa74DF7f0',
        }); 
        console.log('Simulated Transaction: ', results);
        setActiveModal('Success')
    } catch (error) {
        console.error('Simulation error: ', error.message);
        setActiveModal('Error')
    }
  }

  // Submit proof on-chain
  const handleWrite = async (args) => {
    if (!writeContractAsync) {
      console.error('WriteContract function is not initialized.');
      setActiveModal('Error') 
      return;
    }
    try {
      const tx = await writeContractAsync({
        address: SHOPPING_INTENT_ESCROW_CONTRACT.address,
        abi: SHOPPING_INTENT_ESCROW_CONTRACT.abi,
        functionName: 'submitProof',
        args: args,
        gasLimit: '3000000',
      });
      console.log('Transaction submitted: ', tx);
      publishSolver();
      setActiveModal('Success') 
    } catch (error) {
      console.error('Transaction error: ', error.message);
      setActiveModal('Error') 
    }
  };

  // Extract Amazon ASIN
  function extractASIN(url) {
    if (!url.includes('amazon')) {
      console.error('The URL is not an Amazon link.');
      return null;
    }
    const asinRegex = /(?:dp|gp\/product)\/([A-Z0-9]{10})/;
    const match = url.match(asinRegex);
    return match ? match[1] : 'ASIN not found in the URL';
  }

  // Handle Reclaim proof
  const getVerificationReq = async (intent) => {
    // Initialize Reclaim
    const reclaimProofRequest = await ReclaimProofRequest.init(
      APP_ID,
      APP_SECRET,
      PROVIDER_ID
    );
    const requestUrl = await reclaimProofRequest.getRequestUrl();
    setRequestUrl(requestUrl);

    // Start session
    await reclaimProofRequest.startSession({
      onSuccess: async (proofs) => {
        const isValid = await verifyProof(proofs);
        if (isValid) {
          setActiveModal('Valid')  
          console.log('Verification of proof is valid!');
          const intentId = intent?.intentId;

          const productLink = proofs.publicData.itemLink.trim();
          const shippingAddress = proofs.publicData.shippingAddress
            .replace(/\s+/g, ' ')
            .trim();
          const deliveryDate = proofs.publicData.deliveryDate
            .replace(/\s+/g, ' ')
            .trim();
          const finalPriceString = proofs.publicData.finalPrice
            .replace(/\s+/g, ' ')
            .trim();
          const finalPriceValue = parseFloat(
            finalPriceString.match(/[\d.]+/)[0]
          );
          const finalPriceInEther = finalPriceValue / ethUsdRate;
          const finalPriceInWei = parseEther(finalPriceInEther.toString());
          

          setProofs({
            productLink,
            shippingAddress,
            deliveryDate,
            finalPrice: finalPriceString,
          });

          // Hash data
          const productASIN = extractASIN(productLink);
          const hashedProductLink = keccak256(toHex(productASIN));
          const hashedShippingAddress = keccak256(toHex(shippingAddress));

          console.log("productASIN: ", productASIN);
          console.log("hashedProductLink: ", hashedProductLink);
          console.log("hashedShippingAddress: ", hashedShippingAddress);

          const calculatedArgs = [
            intentId,
            hashedProductLink,
            hashedShippingAddress,
            finalPriceInWei,
          ];
          await handleWrite(calculatedArgs);
        } else {
          console.log('Invalid verification - signature verification failed');
          setActiveModal('Error') 
        }
      },
      onError: (error) => {
        console.error('Fetching proof failed', error);
        setActiveModal('Error')
      },
    });
  };

  // When user selects an item (row)
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    getVerificationReq(item);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setRequestUrl(null)
  };

  return (
    <div>
      {/* If not connected, prompt user */}
      {!clientConnected && (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-xl font-semibold">Please connect your wallet to continue</p>
        </div>
      )}

      {/* Table + Modal */}
      <IntentTable
        clientConnected={clientConnected}
        intentCreatedEvents={intentCreatedEvents}
        fulfilledStatuses={fulfilledStatuses}
        remainingTimes={remainingTimes}
        handleItemSelect={handleItemSelect}
        ethUsdRate={ethUsdRate}
        isLoading={isTableLoading}
      />
      <ProofModal
        isModalOpen={isModalOpen}
        onClose={closeModal}
        selectedItem={selectedItem}
        requestUrl={requestUrl}
        activeModal={activeModal}
      />
    </div>
  );
}