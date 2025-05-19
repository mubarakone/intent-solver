import { useEffect, useState } from "react"
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { keccak256, toHex, parseEther } from 'viem';
import { HandCoins, X } from "lucide-react";
import { CONTRACT_ABI } from "../utils/contract_abi";
import dynamic from 'next/dynamic'

// Dynamically import ShareToFarcaster to avoid SSR issues
const ShareToFarcaster = dynamic(() => import('./ShareToFarcaster'), { ssr: false })
const ClientOnly = dynamic(() => import('./ClientOnly'), { ssr: false })

export default function CheckoutModal({ isOpen, onClose, orderDetails }) {
  const [isClient, setIsClient] = useState(false);
  const [activeModal, setActiveModal] = useState("Idle")
  const [transactionHash, setTransactionHash] = useState()
  const [isError, setIsError] = useState()

  useEffect(() => {
    setIsClient(true); // Ensures this runs only on the client
  }, []);

  const {itemMetadata, quantity, totalPrice, checkoutDetails} = orderDetails

  const { address } = useAccount();
  
  const solverFees = totalPrice * 0.02
  const shippingFees = 13
  const totalFees = solverFees + shippingFees 
  const finalPrice = totalPrice + totalFees

  const formattedTotalPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalPrice);

  const formattedFees = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalFees);

  const formattedFinalPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(finalPrice);

  const formattedCheckoutDetails = checkoutDetails?.formattedAddress;
  console.log("formattedCheckoutDetails: ", formattedCheckoutDetails);

  // Filter out firstName and lastName, then combine the rest
  const formattedShippingAddress = Object.entries(checkoutDetails)
    .filter(([key]) => key !== "firstName" && key !== "lastName" && key !== "formattedAddress") // Exclude firstName and lastName
    .map(([, value]) => value) // Get only the values
    .join(" ");

  const formattedShippingDetails = Object.entries(checkoutDetails)
    .filter(([key]) => key !== "formattedAddress") // Exclude firstName and lastName
    .map(([, value]) => value) // Get only the values
    .join(" ");  

  const formattedName = Object.entries(checkoutDetails)
    .filter(([key]) => key === "firstName" || key === "lastName")
    .map(([, value]) => value)
    .join(" ");

  function extractASIN(url) {
    if (!url.includes("amazon")) {
      console.error("The URL is not an Amazon link.");
      return null;
    }
  
    const asinRegex = /(?:dp|gp\/product)\/([A-Z0-9]{10})/;
    const match = url.match(asinRegex);
    return match ? match[1] : "ASIN not found in the URL";
  }

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const SHOPPING_INTENT_ESCROW_CONTRACT = {
    address: '0x6Eff10719fF6d40A5b4874B2244A97CAf768a150',
    abi: CONTRACT_ABI,
  }

  const nextIntentId = useReadContract({
    ...SHOPPING_INTENT_ESCROW_CONTRACT,
    functionName: 'nextIntentId',
    enabled: isClient, // Only run on client
    onError: (error) => {
      if (error.code === 'ACTION_REJECTED') {
        alert('Transaction rejected by the user.');
      } else if (error.message.includes('insufficient funds')) {
        alert('Transaction failed: Insufficient funds.');
      } else {
        alert('Transaction failed: ' + error.message);
      }
    },
    onSuccess: (data) => {
      console.log('Transaction successful:', data);
    },    
  });

  const intentIdValue = nextIntentId?.data;
  const ethUsdRate = 3050;

  const { writeContractAsync } = useWriteContract({enabled: isClient});

  const handleWrite = async () => {

    setActiveModal("Sending")

    const productASIN = extractASIN(itemMetadata?.url)
    console.log("productASIN: ", productASIN)
    const hashedProductLink = keccak256(toHex(productASIN))
    const hashedShippingAddress = keccak256(toHex(formattedCheckoutDetails))

    console.log("hashedProductLink: ", hashedProductLink);
    console.log("hashedShippingAddress: ", hashedShippingAddress);

    const finalPriceInEther = finalPrice / ethUsdRate;
    const finalPriceInWei = parseEther(finalPriceInEther.toString());

    const calculatedArgs = [hashedProductLink, hashedShippingAddress, 3000];
    console.log("Calculated Args: ", calculatedArgs);

    if (!writeContractAsync) {
        console.error("WriteContract function is not initialized.");
        return;
      }
    
      try {
        const tx = await writeContractAsync({
          address: SHOPPING_INTENT_ESCROW_CONTRACT.address,
          abi: SHOPPING_INTENT_ESCROW_CONTRACT.abi,
          functionName: 'createIntent',
          args: calculatedArgs,
          value: finalPriceInWei,
          gasLimit: "3000000", // Optional: Set gas limit for testing
        });
        console.log("Transaction submitted: ", tx);
        handleSubmit();
        setActiveModal("Success")
        setTransactionHash(JSON.stringify(tx))
      } catch (error) {
        console.error("Transaction error: ", error.message);
        setActiveModal("Failed")
        setTransactionHash(error.message)
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit is called!')

    try {
      const res = await fetch("/api/intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentId: Number(intentIdValue),
          buyer: {
            walletAddress: address,
            productLink: formattedShippingDetails,
            shippingAddress: itemMetadata?.url,
            quantity: Number(quantity),
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log('String published successfully!');
      } else {
        console.log(`Error: ${data.error}`);
      }
    } catch (error) {
      console.log(`Request failed: ${error.message}`);
    }
  };

  const IdleModal = () => {
    return (
      <div className="p-3 sm:p-7 overflow-y-auto">
        <div className="text-center">
          <h3
            id="hs-ai-modal-label"
            className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100"
          >
            Order for: {formattedName}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            This order will be fulfilled by a dedicated solver.
          </p>

          <div className="mt-5 sm:mt-6 px-1 sm:px-4 py-3 sm:py-4 bg-gray-100 dark:bg-black rounded-md">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Product</p>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">{itemMetadata.title}</span>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100">{quantity}</span>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100">{formattedTotalPrice}</span>
              </div>

              <div className="sm:col-span-4">
                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-3 rounded-md">
                  <div className="flex items-center gap-x-3">
                    <div className="flex-shrink-0 flex justify-center items-center size-10 sm:size-12 border border-gray-200 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-black">
                      <HandCoins className="size-5 text-gray-600 dark:text-gray-300" />
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100">
                        Payment
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        ${finalPrice.toFixed(2)} (~${shippingFees.toFixed(2)} shipping)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
              onClick={handleWrite}
            >
              Confirm & Pay
            </button>
          </div>
        </div>
      </div>
    )
  }

  const SendingModal = () => {
    return (
      <div className="p-4 sm:p-10 overflow-y-auto">
        <div className="text-center">
          <span className="mx-auto flex justify-center items-center size-[50px] sm:size-[62px] rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
            <div className="animate-spin size-5 sm:size-6 border-t-2 border-blue-600 rounded-full" />
          </span>

          <h3
            className="mt-2 sm:mt-6 text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100"
          >
            Processing Payment
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Please wait while we process your payment...
          </p>

          <div className="mt-4 sm:mt-8 flex justify-center gap-x-2">
            <div className="py-1 sm:py-2 px-3 sm:px-4 inline-flex justify-center items-center gap-x-2 text-xs font-medium rounded-lg cursor-default bg-gray-100 dark:bg-black text-gray-500 dark:text-gray-400">
              <svg
                className="animate-spin size-4 text-gray-500 dark:text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing transaction...
            </div>
          </div>
        </div>
      </div>
    )
  }

  const SuccessModal = () => {
    return (
      <div className="p-4 sm:p-10 overflow-y-auto">
        <div className="text-center">
          <span className="mx-auto flex justify-center items-center size-[50px] sm:size-[62px] rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
            <svg className="size-5 sm:size-6 text-green-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
          </span>

          <h3 className="mt-2 sm:mt-6 text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
            Payment successful
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Your payment has been successfully processed.
          </p>

          <div className="mt-6 sm:mt-10 grid gap-y-3 sm:gap-y-0 sm:gap-x-3 sm:flex sm:justify-center">
            <ClientOnly>
              {isClient && <ShareToFarcaster 
                text={`I just ordered ${itemMetadata.title.substring(0, 30)}... on Storerunner! 🛍️`}
                url={`https://storerunner.xyz/intents/${intentIdValue}`}
                via="storerunner.xyz"
                onSuccess={() => console.log('Shared to Farcaster!')}
              />}
            </ClientOnly>
          </div>

          <div className="mt-5 sm:mt-8">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Transaction hash: <a href={`https://holesky.etherscan.io/tx/${transactionHash}`} className="text-blue-600 dark:text-blue-400 decoration-2 hover:underline font-medium" target="_blank">{transactionHash.slice(0, 10)}...{transactionHash.slice(-10)}</a>
            </p>
          </div>

          <div className="mt-12 flex justify-end">
            <button
              type="button"
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const FailedModal = () => {
    return (
      <div className="p-3 sm:p-7 overflow-y-auto">
        <div className="text-center">
          <h3
            id="hs-ai-modal-label"
            className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100"
          >
            Order Failed!
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Intent #{intentIdValue ?? " "}
          </p>
        </div>

        <div className="mt-4 sm:mt-10">
          <p className="text-xs sm:text-sm text-red-500 dark:text-red-400 break-words">
            {transactionHash}
          </p>
        </div>

        {/* Button */}
        <div className="mt-4 sm:mt-5 flex justify-end gap-x-2">
          <button
            onClick={onClose}
            className="py-2 px-3 inline-flex items-center gap-x-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            Close
          </button>
        </div>
        {/* End Buttons */}

        <div className="mt-4 sm:mt-10">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            If you have any questions, please contact us at{" "}
            <a
              className="inline-flex items-center gap-x-1.5 text-blue-600 dark:text-blue-400 decoration-2 hover:underline font-medium"
              href="#"
            >
              example@site.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  function renderModal() {
    switch (activeModal) {
      case "Idle":
        return <IdleModal />;
      case "Sending":
        return <SendingModal />;
      case "Success":
        return <SuccessModal />;  
      case "Failed":
        return <FailedModal />;    
      default:
        return <IdleModal />;
    }
  }

  return (
    <>
      {/* Modal */}
      <div 
        className={`fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex justify-center items-center transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`} 
        role="dialog" 
        tabIndex="-1" 
        aria-labelledby="modal-title"
      >
        <div className="w-full max-w-[92%] sm:max-w-lg sm:w-full m-3 sm:mx-auto">
          <div className="relative flex flex-col bg-white dark:bg-gray-800 shadow-lg rounded-xl pointer-events-auto">
            <div className="relative overflow-hidden min-h-28 sm:min-h-32 bg-gray-900 dark:bg-black text-center rounded-t-xl">
              {/* Close Button */}
              <div className="absolute top-2 end-2 z-10">
                <button 
                  onClick={onClose} 
                  type="button" 
                  className="size-7 sm:size-8 inline-flex justify-center items-center rounded-full border border-transparent bg-white/10 text-white hover:bg-white/20 focus:outline-none disabled:opacity-50 disabled:pointer-events-none" 
                  aria-label="Close"
                >
                  <span className="sr-only">Close</span>
                  <X className="size-4" />
                </button>
              </div>
              {/* End Close Button */}

              {/* SVG Background Element */}
              <svg className="absolute inset-x-0 bottom-0 text-white dark:text-gray-800" viewBox="0 0 1440 48">
                <path fill="currentColor" d="M0 48h1440V0c-286.7 31.3-573.3 47-860 47-286.7 0-433-15.7-580-47v48z"></path>
              </svg>
              {/* End SVG Background Element */}
            </div>

            <div className="relative z-10 -mt-10 sm:-mt-12">
              {/* Icon */}
              <span className="mx-auto flex justify-center items-center size-[50px] sm:size-[62px] rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
                <svg className="shrink-0 size-5 sm:size-6" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27zm.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0l-.509-.51z"/>
                  <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </span>
              {/* End Icon */}
            </div>

            {/* Body */}
            {renderModal()}
            {/* End Body */}
          </div>
        </div>
      </div>
      {/* End Modal */}
    </>
  )
}