'use client'

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { ReclaimProofRequest, verifyProof } from '@reclaimprotocol/js-sdk';
import { keccak256, toHex } from 'viem';
import { useWriteContract, useWatchContractEvent } from 'wagmi';
import { CONTRACT_ABI } from '@/utils/contract_abi';
 
function ReclaimDemo() {

  // State to store the verification request URL
  const [requestUrl, setRequestUrl] = useState('');
  const [proofs, setProofs] = useState();
  const [intentCreatedEvents, setIntentCreatedEvents] = useState([]);
  const [proofSubmittedEvents, setProofSubmittedEvents] = useState([]);
  const [transactionHash, setTransactionHash] = useState(null);

  // Your credentials from the Reclaim Developer Portal
  // Replace these with your actual credentials

  const APP_ID = '0xcf3F46e591bD71d21685F206A02DD7a78510de00';
  const APP_SECRET = '0x5b1ed296b7c605d0c43d574bbc22153c598bf2f643f14bb132d8001358c2e312';
  const PROVIDER_ID = '1b554fcc-7c9d-4291-84f6-6f73ddeda92f';

  const SHOPPING_INTENT_ESCROW_CONTRACT = {
    address: '0x6Eff10719fF6d40A5b4874B2244A97CAf768a150',
    abi: CONTRACT_ABI,
  }

  const IntentsCreated = () => {
    // Listen to contract events using `useWatchContractEvent`
    useWatchContractEvent({
      ...SHOPPING_INTENT_ESCROW_CONTRACT,
      eventName: 'IntentCreated', // The event name to listen to
      onLogs: (logs) => {
        // logs contain the decoded event data
        const newEvents = logs.map((log) => ({
          intentId: log.args.intentId,
          buyerAddress: log.args.buyer,
          deposit: log.args.deposit,
          hashedProductLink: log.args.hashedProductLink,
          hashedShippingAddr: log.args.hashedShippingAddr,
          deadline: log.args.deadline,
        }));
        setIntentCreatedEvents((prev) => [...prev, ...newEvents]);
      },
    });
    return (
      <div>
        <h1>Contract Events</h1>
        <ul>
          {intentCreatedEvents.map((event, index) => (
            <li key={index}>
              <strong>ID:</strong> {event.id} | <strong>User:</strong> {event.user} | <strong>Value:</strong> {event.value}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const { write, isError } = useWriteContract({
    ...SHOPPING_INTENT_ESCROW_CONTRACT,
    functionName: 'submitProof',
    onError: (error) => {
      if (error.code === 'ACTION_REJECTED') {
        alert('Transaction rejected by the user.');
      } else if (error.message.includes('insufficient funds')) {
        alert('Transaction failed: Insufficient funds.');
      } else {
        alert('Transaction failed: ' + error.message);
      }
    },
    onSuccess: (tx, data) => {
      setTransactionHash(tx.hash); // Track the transaction hash
      console.log('Transaction successful:', data);
    },    
  });

  useWatchContractEvent({
    ...SHOPPING_INTENT_ESCROW_CONTRACT,
    eventName: 'ProofSubmitted',

    onLogs(logs) {
      console.log('New logs!', logs)
      
      // logs contain the decoded event data
      const filteredLogs = logs.filter(
        (log) => log.transactionHash === transactionHash // Match the current transaction
      );

      const newEvents = filteredLogs.map((log) => ({
        intentId: log.args.intentId,
        solverAddress: log.args.solver,
        solverHashedProductLink: log.args.solverHashedProductLink,
        solverHashedShippingAddr: log.args.solverHashedShippingAddr,
        finalPrice: log.args.finalPrice,
        solverFee: log.args.solverFee,
        solverPayout: log.args.solverPayout,
        leftoverBuyerRefund: log.args.leftoverBuyerRefund,
      }));
      
      setProofSubmittedEvents(newEvents);

    },
  })

  const handleWrite = async (calculatedArgs) => {
    try {

      await write?.({
        args: calculatedArgs,
      });

    } catch (error) {
      console.error('Error while calling write:', error.message);
      console.log(error.data)
    }
  };

  function extractASIN(url) {
    if (!url.includes("amazon")) {
      console.error("The URL is not an Amazon link.");
      return null;
    }
  
    const asinRegex = /(?:dp|gp\/product)\/([A-Z0-9]{10})/;
    const match = url.match(asinRegex);
    return match ? match[1] : "ASIN not found in the URL";
  }
 
  const getVerificationReq = async () => {
 
    // Initialize the Reclaim SDK with your credentials
    const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);
 
    // Generate the verification request URL
    const requestUrl = await reclaimProofRequest.getRequestUrl();

    console.log('Request URL:', requestUrl);

    setRequestUrl(requestUrl);
 
    // Start listening for proof submissions
    await reclaimProofRequest.startSession({

      // Called when the user successfully completes the verification
      onSuccess: async (proofs) => {

        console.log('Fetching proof success', proofs);

        // Add your success logic here, such as:
        // - Updating UI to show verification success
        // - Storing verification status
        // - Redirecting to another page
        
        const isValid = await verifyProof(proofs);

        if (isValid) {
            console.log('Verification of proof is valid!')

            const intentId = 0
            
            const productLink = proofs.publicData.itemLink.trim(); // No extra cleaning needed since it's already a URL.

            const shippingAddress = proofs.publicData.shippingAddress
              .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with a single space.
              .trim(); // Trim leading and trailing spaces.

            const deliveryDate = proofs.publicData.deliveryDate
              .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with a single space.
              .trim(); // Trim leading and trailing spaces.

            const finalPriceString = proofs.publicData.finalPrice
              .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with a single space.
              .trim(); // Trim leading and trailing spaces.

            const finalPriceValue = parseFloat(finalPriceString.match(/[\d.]+/)[0]); // Extract numeric part and convert to float.

            setProofs({
              productLink: productLink,
              shippingAddress: shippingAddress,
              deliveryDate: deliveryDate,
              finalPrice: finalPriceString
            })

            console.log('ProductLink: ', productLink)
            console.log('ShippingAddress: ', shippingAddress)
            console.log('DeliveryDate: ', deliveryDate)
            console.log('FinalPrice: ', finalPriceValue)

            const productASIN = extractASIN(productLink)
            const hashedProductLink = keccak256(toHex(productASIN))
            const hashedShippingAddress = keccak256(toHex(shippingAddress))

            const calculatedArgs = [intentId, hashedProductLink, hashedShippingAddress, finalPriceValue];

            await handleWrite(calculatedArgs)

        } else {
            console.log('Invalid verification - signature verification failed')
        }
      },
      // Called if there's an error during verification
      onError: (error) => {

        console.error('Fetching proof failed', error);
 
        // Add your error handling logic here, such as:
        // - Showing error message to user
        // - Resetting verification state
        // - Offering retry options
      },
    });
  };
 
  return (
    <>
      <button onClick={getVerificationReq}>Get Verification Request</button>

      {/* Display QR code when URL is available */}

      {requestUrl && (
        <div style={{ margin: '20px 0' }}>
          <QRCode value={requestUrl} />
        </div>
      )}

      {proofs && (
        <div>
          <h2>Verification Successful!</h2>
          <pre>{JSON.stringify(proofs, null, 2)}</pre>
        </div>
      )}
    </>
  );
}
 
export default ReclaimDemo;
