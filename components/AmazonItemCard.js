'use client'

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"

export default function AmazonItemCard({ metadata, onDiscard, onQuantityChange, findTotalPrice }) {
  const [quantity, setQuantity] = useState(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleQuantityChange = (e) => {
    const newQuantity = Number.parseInt(e.target.value, 10)
    setQuantity(newQuantity)
    onQuantityChange(newQuantity)
  }

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

  // Call `findTotalPrice` in a `useEffect` when `quantity` changes
  useEffect(() => {
    if (!mounted) return;
    
    if (metadata?.price) {
      const numericPrice = extractPriceValue(metadata.price);
      const totalPrice = numericPrice * quantity;
      findTotalPrice(totalPrice); // Update total price after rendering
    }
  }, [quantity, metadata, findTotalPrice, mounted]);

  // Truncate long titles for mobile display
  const truncateTitle = (title, maxLength = 60) => {
    if (!title) return '';
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6 relative">
      <button
        onClick={onDiscard}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        aria-label="Discard order"
      >
        <Trash2 size={18} className="sm:size-5" />
      </button>

      {/* Mobile layout (stacked) */}
      <div className="flex flex-col sm:hidden">
        <div className="flex items-center mb-3">
          <img 
            src={metadata.image || "/placeholder.svg"} 
            alt={metadata.title} 
            className="w-16 h-16 object-cover mr-3 rounded-md" 
          />
          <div className="flex-1 min-w-0">
            <a 
              href={metadata.url} 
              className="text-blue-500 dark:text-blue-400 text-sm font-semibold underline line-clamp-2 break-words" 
              target="_blank"
            >
              {truncateTitle(metadata.title, 40)}
            </a>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-xs mb-3">{truncateTitle(metadata.description, 80)}</p>
        <div className="flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-200 font-bold text-lg">{calculateTotalPrice()}</p>
          <div className="flex items-center">
            <label htmlFor="quantity-mobile" className="mr-2 text-xs font-medium text-gray-700 dark:text-gray-300">
              Qty:
            </label>
            <select
              id="quantity-mobile"
              value={quantity}
              onChange={handleQuantityChange}
              className="block w-14 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm text-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              {[...Array(30)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop layout (horizontal) */}
      <div className="hidden sm:flex sm:items-center">
        <img src={metadata.image || "/placeholder.svg"} alt={metadata.title} className="w-20 h-20 object-cover mr-4 rounded-md" />
        <div className="flex-1">
          <a href={metadata.url} className="text-blue-500 dark:text-blue-400 text-xl underline font-semibold" target="_blank">{metadata.title}</a>
          <p className="text-gray-700 dark:text-gray-300 flex-grow">{metadata.description}</p>
          <div className="mt-3 flex justify-between items-center">
            <p className="text-gray-600 dark:text-gray-200 font-bold text-xl">{calculateTotalPrice()}</p>
            <div className="flex items-center ml-4">
              <label htmlFor="quantity-desktop" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Qty:
              </label>
              <select
                id="quantity-desktop"
                value={quantity}
                onChange={handleQuantityChange}
                className="block w-16 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                {[...Array(30)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}