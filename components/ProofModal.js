'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { ScanQrCodeIcon, CheckCircle, XCircle } from 'lucide-react';

/**
 * Displays the modal with a QR code for proof submission.
 */
export default function ProofModal({
  isModalOpen,
  onClose,
  selectedItem,
  requestUrl,
  activeModal
}) {
  const [intentData, setIntentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isModalOpen || !selectedItem) return;
    
    const fetchIntentData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/intents?intent_id=${selectedItem.intentId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch intent data');
        }
        const responseData = await res.json();
        
        // Check if we have data in the response
        if (responseData.data && responseData.data.length > 0) {
          setIntentData(responseData.data[0]);
        } else {
          setError('Intent data not found');
        }
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIntentData();
  }, [isModalOpen, selectedItem]);

  // If the modal isn't open, don't render anything
  if (!isModalOpen) return null;

  const IdleModal = () => {
    return (
      <div className="p-4 sm:p-7 overflow-y-auto max-h-[80vh]">
        <div className="text-center">
          {intentData ? (
            <div className="grid grid-rows-2">
              <h3
                id="hs-ai-invoice-modal-label"
                className="text-lg font-semibold text-gray-800"
              >
                {intentData.shipping_address ? (
                  intentData.shipping_address
                ) : (
                  <div className="flex justify-center animate-pulse bg-gray-200 w-[60px] h-[20px] rounded flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No address available</span>
                  </div>
                )}
              </h3>
              {intentData.product_link && (
                <a
                  id="hs-ai-invoice-modal-label"
                  className="text-md font-semibold text-blue-500 underline"
                  href={intentData.product_link}
                  target="_blank"
                >
                  {intentData.product_link.slice(0, 48)}...
                </a>
              )}
            </div>
          ) : loading ? (
            // Skeleton placeholder while loading
            <div className="animate-pulse bg-gray-200 w-[250px] h-[50px] rounded flex items-center justify-center">
              <span className="text-gray-400 text-sm">Loading...</span>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : null}
          <p className="text-sm text-gray-500">
            {selectedItem
              ? `Intent ID: ${selectedItem.intentId}`
              : "No item selected"}
          </p>
        </div>

        <div className="mt-5 flex justify-center">
          {requestUrl ? (
            <QRCode value={requestUrl} />
          ) : (
            // Skeleton placeholder while we have no requestUrl
            <div className="animate-pulse bg-gray-200 w-[180px] h-[180px] rounded flex items-center justify-center">
              <span className="text-gray-400 text-sm">Loading...</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-x-2">
          <button
            onClick={onClose}
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Close
          </button>

          <button className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none">
            Print
          </button>
        </div>
      </div>
    );
  }

  const ValidModal = () => {
    return (
      <div className="p-4 sm:p-7 overflow-y-auto max-h-[80vh]">
        <div className="text-center">
          <h3
            id="hs-ai-invoice-modal-label"
            className="text-lg font-semibold text-gray-800"
          >
            Proof is Valid!
          </h3>
          <p className="text-sm text-gray-500">
            {selectedItem
              ? `Intent ID: ${selectedItem.intentId}`
              : "No item selected"}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center mt-5">
          <h4 className="text-lg font-semibold dark:text-neutral-200">
            Waiting for you to submit your proof onchain...
          </h4>
          <div
            className="mt-5 animate-spin inline-block size-20 border-[3px] border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"
            role="status"
            aria-label="loading"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const SuccessModal = () => {
    return (
        <div className="p-4 sm:p-7 overflow-y-auto max-h-[80vh]">
          <div className="text-center">
            <h3
                  id="hs-ai-invoice-modal-label"
                  className="text-lg font-semibold text-gray-800"
                >
                  Proof successfully submitted!
                </h3> 
            <p className="text-sm text-gray-500">
              {selectedItem
                ? `Intent ID: ${selectedItem.intentId}`
                : "No item selected"}
            </p>
          </div>

          <div className="mt-5 flex justify-center">
            <CheckCircle size={50}/>
          </div>

          <div className="mt-5 flex justify-end gap-x-2">
            <button
              onClick={onClose}
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
    )
  }

  const ErrorModal = () => {
    return (
        <div className="p-4 sm:p-7 overflow-y-auto max-h-[80vh]">
          <div className="text-center">
            <h3
                  id="hs-ai-invoice-modal-label"
                  className="text-lg font-semibold text-gray-800"
                >
                  Proof failed
                </h3> 
            <p className="text-sm text-gray-500">
              {selectedItem
                ? `Intent ID: ${selectedItem.intentId}`
                : "No item selected"}
            </p>
          </div>

          <div className="mt-5 flex justify-center">
            <XCircle size={50} />
          </div>

          <div className="mt-5 flex justify-end gap-x-2">
            <button
              onClick={onClose}
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
    )
  }

  const renderModal = () => {
    switch (activeModal) {
      case "Idle":
        return <IdleModal />;
      case "Valid":
        return <ValidModal />;
      case "Success":
        return <SuccessModal />;
      case "Error":
        return <ErrorModal />;
      default:
        return <IdleModal />;
    }
  };

  return (
    <div
      id="hs-ai-invoice-modal"
      className={`fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center transition-all duration-500 ${
        isModalOpen
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex flex-col bg-white shadow-lg rounded-xl w-full max-w-lg mx-auto mt-16">
        {/* Modal header background */}
        <div className="relative overflow-hidden min-h-32 bg-gray-900 text-center rounded-t-xl">
          {/* Close Button */}
          <div className="absolute top-2 right-2">
            <button
              type="button"
              onClick={onClose}
              className="flex justify-center items-center w-7 h-7 text-sm font-semibold rounded-full border border-transparent text-white/70 hover:bg-white/10 focus:outline-none focus:bg-white/10"
            >
              <span className="sr-only">Close</span>
              <svg
                className="flex-shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Icon */}
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-20 flex justify-center items-center rounded-full border-4 border-white text-white">
            <ScanQrCodeIcon size={40} />
          </span>

          {/* Background Radials */}
          <div className="absolute top-0 inset-0">
            <div className="bg-gradient-to-tr from-blue-900 via-gray-900 to-gray-900 w-full h-full opacity-90"></div>
          </div>
        </div>

        {/* Content */}
        {renderModal()}
      </div>
    </div>
  );
}