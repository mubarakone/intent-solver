import { useState, useEffect } from "react"

export default function ItemHistoryCard({ intent, onScrape }) {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(intent?.quantity || 1);

  useEffect(() => {
    const fetchProductMetadata = async () => {
      setLoading(true);
      try {
        const data = await onScrape();
        if (data) {
          setMetadata(data);
        }
      } catch (error) {
        console.error("Error fetching product metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductMetadata();
  }, [onScrape]);

  // Helper function to extract numeric value from the price string
  const extractPriceValue = (priceString) => {
    if (!priceString) return 0;
    const numericPrice = parseFloat(priceString.replace(/[^0-9.]/g, ''));
    return isNaN(numericPrice) ? 0 : numericPrice;
  };

  // Calculate total price based on selected quantity
  const calculateTotalPrice = () => {
    if (!metadata || !metadata.price) return '$0.00';
    const numericPrice = extractPriceValue(metadata.price);
    const totalPrice = numericPrice * quantity;

    // Format total price to include the dollar sign and two decimal places
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(totalPrice);
  };

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 relative animate-pulse">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-gray-200 rounded mr-4"></div>
          <div className="w-full">
            <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 relative">
        <div className="text-center text-gray-600">
          <p>Could not load product information</p>
          <p className="text-sm mt-2 break-all">{intent.product_link}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 relative">
      <div className="flex items-center">
        <img src={metadata.image || "/placeholder.svg"} alt={metadata.title} className="w-20 h-20 object-cover mr-4" />
        <div>
          <a href={metadata.url} className="text-blue-500 text-xl underline font-semibold" target="_blank">{metadata.title}</a>
          <p className="text-gray-700 flex-grow">{metadata.description}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-gray-600 font-bold text-xl">{calculateTotalPrice()}</p>
        <div className="flex items-center ml-4">
          <div className="mr-2 text-sm font-medium text-gray-700">
            Qty:
          </div>
          <div
            className="block w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            {quantity}
          </div>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        <p>Order ID: {intent.intent_id}</p>
        <p>Date: {new Date(intent.timestamp).toLocaleDateString()}</p>
        {intent.solver_wallet_address && (
          <p className="text-green-600">
            Solver assigned: {intent.solver_wallet_address.slice(0, 6)}...{intent.solver_wallet_address.slice(-4)}
          </p>
        )}
      </div>
    </div>
  )
}