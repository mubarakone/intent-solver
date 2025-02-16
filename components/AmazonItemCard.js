import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"

export default function AmazonItemCard({ metadata, onDiscard, onQuantityChange, findTotalPrice }) {
  const [quantity, setQuantity] = useState(1)

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
    if (metadata?.price) {
      const numericPrice = extractPriceValue(metadata.price);
      const totalPrice = numericPrice * quantity;
      findTotalPrice(totalPrice); // Update total price after rendering
    }
  }, [quantity, metadata, findTotalPrice]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 relative">
      <button
        onClick={onDiscard}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        aria-label="Discard order"
      >
        <Trash2 size={20} />
      </button>
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
          <label htmlFor="quantity" className="mr-2 text-sm font-medium text-gray-700">
            Qty:
          </label>
          <select
            id="quantity"
            value={quantity}
            onChange={handleQuantityChange}
            className="block w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
  )
}