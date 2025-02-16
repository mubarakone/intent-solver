import { useEffect, useState } from "react"
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { keccak256, toHex, parseEther } from 'viem';
import { HandCoins } from "lucide-react";
import { CONTRACT_ABI } from "../utils/contract_abi";

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
    enabled: typeof window !== "undefined", // ✅ Prevents SSR execution
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

  const { writeContractAsync } = useWriteContract({enabled: isClient,});

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
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [formattedShippingDetails, itemMetadata?.url] }),
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
      <div className="p-4 sm:p-7 overflow-y-auto">
        <div className="text-center">
          <h3
            id="hs-ai-modal-label"
            className="text-lg font-semibold text-gray-800 dark:text-neutral-200"
          >
            Order for: {formattedName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-neutral-500">
            Intent #{intentIdValue ?? " "}
          </p>
        </div>

        {/* <!-- Grid --> */}
        <div className="mt-5 sm:mt-10 grid grid-cols-2 sm:grid-cols-3 gap-5">
          <div>
            <span className="block text-xs uppercase text-gray-500 dark:text-neutral-500">
              Shipping Address:
            </span>
            <span className="block text-sm font-medium text-gray-800 dark:text-neutral-200">
              {formattedShippingAddress}
            </span>
          </div>
          {/* <!-- End Col --> */}

          <div>
            <span className="block text-xs uppercase text-gray-500 dark:text-neutral-500">
              Total Amount:
            </span>
            <span className="block text-sm font-medium text-gray-800 dark:text-neutral-200">
              {formattedFinalPrice}
            </span>
          </div>
          {/* <!-- End Col --> */}

          <div>
            <span className="block text-xs uppercase text-gray-500 dark:text-neutral-500">
              Wallet Address:
            </span>
            <div className="flex items-center gap-x-2">
              <svg
                className="size-5"
                width="400"
                height="248"
                viewBox="0 0 400 248"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0)">
                  <path d="M254 220.8H146V26.4H254V220.8Z" fill="#FF5F00" />
                  <path
                    d="M152.8 123.6C152.8 84.2 171.2 49 200 26.4C178.2 9.2 151.4 0 123.6 0C55.4 0 0 55.4 0 123.6C0 191.8 55.4 247.2 123.6 247.2C151.4 247.2 178.2 238 200 220.8C171.2 198.2 152.8 163 152.8 123.6Z"
                    fill="#EB001B"
                  />
                  <path
                    d="M400 123.6C400 191.8 344.6 247.2 276.4 247.2C248.6 247.2 221.8 238 200 220.8C228.8 198.2 247.2 163 247.2 123.6C247.2 84.2 228.8 49 200 26.4C221.8 9.2 248.6 0 276.4 0C344.6 0 400 55.4 400 123.6Z"
                    fill="#F79E1B"
                  />
                </g>
                <defs>
                  <clipPath id="clip0">
                    <rect width="400" height="247.2" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span className="block text-sm font-medium text-gray-800 dark:text-neutral-200">
                ({address.slice(0, 6)}...{address.slice(-4)})
              </span>
            </div>
          </div>
          {/* <!-- End Col --> */}
        </div>
        {/* <!-- End Grid --> */}

        <div className="mt-5 sm:mt-10">
          <h4 className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
            Summary
          </h4>

          <ul className="mt-3 flex flex-col">
            <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
              <div className="flex items-center justify-between w-full">
                <span>
                  <b>{`(${quantity})`}</b> {itemMetadata.title.slice(0, 48)}...
                </span>
                <span>{formattedTotalPrice}</span>
              </div>
            </li>
            <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
              <div className="flex items-center justify-between w-full">
                <span>
                  Fees you need to pay at most <span className="text-xs">(Solver + Shipping + Taxes)</span>
                </span>
                <span>{formattedFees}</span>
              </div>
            </li>
            <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm font-semibold bg-gray-50 border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200">
              <div className="flex items-center justify-between w-full">
                <span>Total Amount</span>
                <span>{formattedFinalPrice}</span>
              </div>
            </li>
          </ul>
        </div>

        {/* <!-- Button --> */}
        <div className="mt-5 flex justify-end gap-x-2">
          <a
            onClick={onClose}
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50 dark:bg-transparent dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
          >
            Cancel
          </a>
          <button
            onClick={handleWrite}
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            Confirm
            <HandCoins size={15} />
          </button>
        </div>
        {/* <!-- End Buttons --> */}

        <div className="mt-5 sm:mt-10">
          <p className="text-sm text-gray-500 dark:text-neutral-500">
            If you have any questions, please contact us at{" "}
            <a
              className="inline-flex items-center gap-x-1.5 text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium dark:text-blue-500"
              href="#"
            >
              example@site.com
            </a>{" "}
            or call at{" "}
            <a
              className="inline-flex items-center gap-x-1.5 text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium dark:text-blue-500"
              href="tel:+1898345492"
            >
              +1 898-34-5492
            </a>
          </p>
        </div>
      </div>
    );
  }

  const SendingModal = () => {
    return (
      <div className="p-4 sm:p-7 overflow-y-auto">
        <div className="text-center">
          <h3
            id="hs-ai-modal-label"
            className="text-lg font-semibold text-gray-800 dark:text-neutral-200"
          >
            Order for: {formattedName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-neutral-500">
            Intent #{intentIdValue ?? " "}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center mt-5">
          <h4 className="text-lg font-semibold dark:text-neutral-200">
            Sending...
          </h4>
          <div
            className="mt-5 animate-spin inline-block size-20 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"
            role="status"
            aria-label="loading"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>

        <div className="mt-5 sm:mt-10">
          <ul className="mt-3 flex flex-col">
            <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
              <div className="flex items-center justify-between w-full">
                <span>
                  <b>{`(${quantity})`}</b> {itemMetadata.title.slice(0, 48)}...
                </span>
                <span>{formattedFinalPrice}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  const SuccessModal = () => {
    return (
      <div className="p-4 sm:p-7 overflow-y-auto">
        <div className="text-center">
          <h3
            id="hs-ai-modal-label"
            className="text-lg font-semibold text-gray-800 dark:text-neutral-200"
          >
            Order Success!
          </h3>
          <p className="text-sm text-gray-500 dark:text-neutral-500">
            Intent #{intentIdValue ?? " "}
          </p>
        </div>

        <div className="mt-5 sm:mt-10">
          <h4 className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
            Summary
          </h4>

          <ul className="mt-3 flex flex-col">
            <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
              <div className="flex items-center justify-between w-full">
                <span className="block text-xs uppercase text-gray-500 dark:text-neutral-500">
                  Order for: {formattedName}
                </span>
                <span>Intent #{intentIdValue ?? " "}</span>
              </div>
            </li>
            <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
              <div className="flex items-center justify-between w-full">
                <span className="block text-xs uppercase text-gray-500 dark:text-neutral-500">
                  Shipping Address:
                </span>
                <span>{formattedShippingAddress}</span>
              </div>
            </li>
            <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
              <div className="flex items-center justify-between w-full">
                <span className="block text-xs uppercase text-gray-500 dark:text-neutral-500">
                  Wallet Address:
                </span>
                <span>
                  {address}
                </span>
              </div>
            </li>
            <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
              <div className="flex items-center justify-between w-full">
                <span>
                  <b>{`(${quantity})`}</b> {itemMetadata.title.slice(0, 48)}...
                </span>
                <span>{formattedTotalPrice}</span>
              </div>
            </li>
            <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:border-neutral-700 dark:text-neutral-200">
              <div className="flex items-center justify-between w-full">
                <span>
                  Fees <em>(Solver + Shipping + Taxes)</em>
                </span>
                <span>{formattedFees}</span>
              </div>
            </li>
            <li className="inline-flex items-center gap-x-2 py-3 px-4 text-sm font-semibold bg-gray-50 border text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200">
              <div className="flex items-center justify-between w-full">
                <span>Total Amount</span>
                <span>{formattedFinalPrice}</span>
              </div>
            </li>
          </ul>
        </div>

        {/* <!-- Button --> */}
        <div className="mt-5 flex justify-end gap-x-2">
          <a
            onClick={onClose}
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50 dark:bg-transparent dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
          >
            Cancel
          </a>
        </div>
        {/* <!-- End Buttons --> */}

        <div className="mt-5 sm:mt-10">
          <p className="text-sm text-gray-500 dark:text-neutral-500">
            If you have any questions, please contact us at{" "}
            <a
              className="inline-flex items-center gap-x-1.5 text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium dark:text-blue-500"
              href="#"
            >
              example@site.com
            </a>{" "}
            or call at{" "}
            <a
              className="inline-flex items-center gap-x-1.5 text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium dark:text-blue-500"
              href="tel:+1898345492"
            >
              +1 898-34-5492
            </a>
          </p>
        </div>
      </div>
    );
  }

  const FailedModal = () => {
    return (
      <div className="p-4 sm:p-7 overflow-y-auto">
        <div className="text-center">
          <h3
            id="hs-ai-modal-label"
            className="text-lg font-semibold text-gray-800 dark:text-neutral-200"
          >
            Order Failed!
          </h3>
          <p className="text-sm text-gray-500 dark:text-neutral-500">
            Intent #{intentIdValue ?? " "}
          </p>
        </div>

        <div className="mt-5 sm:mt-10">
          <p className="text-sm text-red-500 dark:text-neutral-200">
            {transactionHash}
          </p>
        </div>

        {/* <!-- Button --> */}
        <div className="mt-5 flex justify-end gap-x-2">
          <a
            onClick={onClose}
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50 dark:bg-transparent dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
          >
            Cancel
          </a>
        </div>
        {/* <!-- End Buttons --> */}

        <div className="mt-5 sm:mt-10">
          <p className="text-sm text-gray-500 dark:text-neutral-500">
            If you have any questions, please contact us at{" "}
            <a
              className="inline-flex items-center gap-x-1.5 text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium dark:text-blue-500"
              href="#"
            >
              example@site.com
            </a>{" "}
            or call at{" "}
            <a
              className="inline-flex items-center gap-x-1.5 text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium dark:text-blue-500"
              href="tel:+1898345492"
            >
              +1 898-34-5492
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
{/* <!-- Modal --> */}
<div id="hs-ai-modal" className={`fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center transition-all duration-500 ${
    isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
  }`} role="dialog" tabIndex="-1" aria-labelledby="hs-ai-modal-label">
  <div className="mt-7 opacity-100  ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
    <div className="relative flex flex-col bg-white shadow-lg rounded-xl pointer-events-auto dark:bg-neutral-800">
      <div className="relative overflow-hidden min-h-32 bg-gray-900 text-center rounded-t-xl dark:bg-neutral-950">
        {/* <!-- Close Button --> */}
        <div className="absolute top-2 end-2">
          <button onClick={onClose} type="button" className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:bg-white/20 disabled:opacity-50 disabled:pointer-events-none" aria-label="Close">
            <span className="sr-only">Close</span>
            <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        {/* <!-- End Close Button --> */}

        {/* <!-- SVG Background Element --> */}
        <figure className="absolute inset-x-0 bottom-0 -mb-px">
          <svg preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 1920 100.1">
            <path fill="currentColor" className="fill-white dark:fill-neutral-800" d="M0,0c0,0,934.4,93.4,1920,0v100.1H0L0,0z"></path>
          </svg>
        </figure>
        {/* <!-- End SVG Background Element --> */}
      </div>

      <div className="relative z-10 -mt-12">
        {/* <!-- Icon --> */}
        <span className="mx-auto flex justify-center items-center size-[62px] rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400">
          <svg className="shrink-0 size-6" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27zm.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0l-.509-.51z"/>
            <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </span>
        {/* <!-- End Icon --> */}
      </div>

      {/* <!-- Body --> */}
      {renderModal()}
      {/* <!-- End Body --> */}
    </div>
  </div>
</div>
{/* <!-- End Modal --> */}
</>
  )
}