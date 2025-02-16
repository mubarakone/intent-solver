"use client"

import { useState, useEffect } from "react"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Search } from "lucide-react";
import AmazonItemCard from "../components/AmazonItemCard"
import WalletButton from "../components/WalletButton"
import CheckoutForm from "../components/CheckoutForm"
import CheckoutModal from "../components/CheckoutModal";

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

  const { isConnected } = useAccount();

  useEffect(() => {
    setClientConnected(isConnected);
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

  useEffect(() => {
    console.log(isModalOpen)
  }, [isModalOpen])
  

  return (
    <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleScrape} className="mb-8">
          <div className="mt-10 w-full px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <input
                type="text"
                className="p-4 block w-full border-gray-200 rounded-full text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                placeholder="Enter an Amazon link..."
                value={amazonLink}
                onChange={(e) => setAmazonLink(e.target.value)}
              />
              <div className="absolute top-1/2 end-2 -translate-y-1/2">
                <button
                  type="submit"
                  className="size-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-500 hover:text-gray-800 focus:outline-none focus:text-gray-800 bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-neutral-400 dark:bg-neutral-800 dark:hover:text-white dark:focus:text-white"
                >
                  <Search />
                </button>
              </div>
            </div>
          </div>
        </form>

        {error && <p className="text-red-500 mt-4">{error}</p>}
        {itemMetadata && (
          <AmazonItemCard
            findTotalPrice={setTotalPrice}
            metadata={itemMetadata}
            onDiscard={handleDiscardOrder}
            onQuantityChange={handleQuantityChange}
          />
        )}

        <div className="mt-8">
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

        <div className="mt-12 text-center">
          <a href="/solver" className="text-blue-500 hover:text-blue-700">
            Are you a Solver? Log In Here
          </a>
        </div>
      </div>
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
          // Add any other relevant details here
        }}
      />
    </main>
  );
}