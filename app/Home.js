"use client"

import { useState, useEffect } from "react"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Search } from "lucide-react";
import AmazonItemCard from "../components/AmazonItemCard"
import WalletButton from "../components/WalletButton"
import CheckoutForm from "../components/CheckoutForm"
import CheckoutModal from "../components/CheckoutModal";
import dynamic from 'next/dynamic'

// Dynamically import components to avoid SSR issues
const AddToFarcaster = dynamic(() => import('../components/AddToFarcaster'), { ssr: false })
const ClientOnly = dynamic(() => import('../components/ClientOnly'), { ssr: false })

export default function Home() {
  const [amazonLink, setAmazonLink] = useState("")
  const [itemMetadata, setItemMetadata] = useState(null)
  const [isCheckoutStarted, setIsCheckoutStarted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [totalPrice, setTotalPrice] = useState(0)
  const [checkoutDetails, setCheckoutDetails] = useState({})
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientConnected, setClientConnected] = useState(false);
  const [isFarcasterMiniApp, setIsFarcasterMiniApp] = useState(false)

  const { isConnected } = useAccount();

  useEffect(() => {
    setClientConnected(isConnected);
    
    // Only import and use on client
    import('../utils/isMiniApp').then(({ isMiniAppSafe }) => {
      setIsFarcasterMiniApp(isMiniAppSafe());
    });
  }, [isConnected]);

  const handleProceedToCheckout = () => {
    setIsCheckoutStarted(true)
  }
  
  const handleDiscardOrder = () => {
    setItemMetadata(null)
    setAmazonLink("")
    setIsCheckoutStarted(false)
    setQuantity(1)
  }

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity)
  }

  const handleScrape = async (e) => {
    e.preventDefault();

    if (!amazonLink || !amazonLink.startsWith('http')) {
      setError('Please enter a valid Amazon URL');
      return;
    }
  
    setLoading(true);
    setError('');
    setItemMetadata(null);
  
    try {
      console.log('Sending request with URL:', amazonLink);
      setItemMetadata({
        title: "",
        price: "",
        image: "",
        description: "Fetching product...",
      });
  
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: amazonLink.trim() }),  // Ensure no extra spaces
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Scraped product data:', data);
      setItemMetadata(data);
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Farcaster-specific components */}
      <ClientOnly>
        {isFarcasterMiniApp && (
          <div className="mb-6">
            <AddToFarcaster 
              onSuccess={() => console.log('App added to Farcaster!')}
            />
          </div>
        )}
      </ClientOnly>
      
      <main className="bg-white dark:bg-gray-800 py-5 sm:py-8 px-2 sm:px-4 lg:px-8 rounded-lg shadow-sm mb-2">
        <div className="max-w-3xl mx-auto w-full">
          <form onSubmit={handleScrape} className="mb-4">
            <div className="w-full">
              <div className="relative">
                <input
                  type="text"
                  className="p-3 sm:p-4 block w-full border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-full text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                  placeholder="Enter an Amazon link..."
                  value={amazonLink}
                  onChange={(e) => setAmazonLink(e.target.value)}
                />
                <div className="absolute top-1/2 end-2 -translate-y-1/2">
                  <button
                    type="submit"
                    className="size-8 sm:size-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-500 hover:text-gray-800 focus:outline-none focus:text-gray-800 bg-gray-100 dark:bg-black dark:text-gray-300 dark:hover:text-white disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {loading && (
            <div className="flex justify-center my-4">
              <div className="animate-spin size-6 border-t-2 border-blue-600 rounded-full"></div>
            </div>
          )}

          {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
          
          {itemMetadata && (
            <div className="mt-4">
              <AmazonItemCard
                findTotalPrice={setTotalPrice}
                metadata={itemMetadata}
                onDiscard={handleDiscardOrder}
                onQuantityChange={handleQuantityChange}
              />
            </div>
          )}

          <div className="mt-6 sm:mt-8">
            {!isCheckoutStarted ? (
              <WalletButton
                isDisabled={!itemMetadata}
                onProceedToCheckout={handleProceedToCheckout}
              />
            ) : (
              <CheckoutForm
                onSubmit={(formData) => setCheckoutDetails(formData)}
                onOpenModal={() => {
                  console.log("Modal state change triggered");
                  setIsModalOpen(true);
                }}
              />
            )}
          </div>
        </div>
      </main>
      
      <CheckoutModal
        key={isModalOpen ? "open" : "closed"}
        isOpen={isModalOpen}
        onClose={() => {
          console.log("Closing modal...");
          setIsModalOpen(false);
        }}
        orderDetails={{
          itemMetadata,
          quantity,
          totalPrice,
          checkoutDetails,
        }}
      />
    </div>
  );
}