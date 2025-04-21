'use client'

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ItemHistoryCard from "../components/ItemHistoryCard";

export default function History() {
  const [clientConnected, setClientConnected] = useState(false);
  const [itemMetadata, setItemMetadata] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });

  const { isConnected, address } = useAccount();

  useEffect(() => {
    setClientConnected(isConnected);

    if (isConnected && address) {
      fetchHistory();
    }
  }, [isConnected, address, pagination.page]);

  const fetchHistory = async () => {
    if (!address) {
      console.error("Please connect your wallet");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(
        `/api/intents?wallet_address=${address}&page=${pagination.page}&limit=${pagination.limit}`
      );
      
      if (!res.ok) {
        throw new Error("Failed to fetch history");
      }
      
      const responseData = await res.json();
      
      setResults(responseData.data || []);
      setPagination({
        ...pagination,
        total: responseData.pagination?.total || 0,
        totalPages: responseData.pagination?.totalPages || 0
      });
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async (intent) => {
    const amazonLink = intent?.product_link;

    if (!amazonLink) {
      console.error("No product link available");
      return null;
    }

    try {
      console.log("Sending request with URL:", amazonLink);

      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: amazonLink.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Scraped product data:", data);
      return data;
    } catch (err) {
      console.error("Fetch error:", err.message);
      return null;
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination({ ...pagination, page: pagination.page + 1 });
    }
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination({ ...pagination, page: pagination.page - 1 });
    }
  };

  return (
    <div>
      {!clientConnected && (
        <div className="bg-white shadow-md rounded-lg p-6 text-center flex justify-center">
          <p className="text-xl font-semibold">
            Please connect your wallet to continue
          </p>
          <div className="mt-5">
            <ConnectButton />
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          Error: {error}
        </div>
      )}

      {clientConnected && !loading && !error && (
        <div className="mb-4 text-gray-600">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Purchase History</h2>
          <p>Showing your most recent purchases first</p>
        </div>
      )}

      <ul className="space-y-4">
        {results.map((intent) => (
          <li
            key={intent.id}
            className="border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            <ItemHistoryCard 
              intent={intent}
              onScrape={() => handleScrape(intent)}
            />
          </li>
        ))}
      </ul>

      {results.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrevPage}
            disabled={pagination.page <= 1}
            className={`px-4 py-2 rounded ${
              pagination.page <= 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>
          
          <span className="text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={pagination.page >= pagination.totalPages}
            className={`px-4 py-2 rounded ${
              pagination.page >= pagination.totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {results.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">No history found.</p>
        </div>
      )}
    </div>
  );
}
