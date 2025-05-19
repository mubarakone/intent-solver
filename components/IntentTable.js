'use client';

import React, { useState, useEffect } from 'react';
import { ScanQrCodeIcon, FilterIcon, ChevronRightIcon, ChevronDown, ChevronUp } from 'lucide-react';
import dynamic from 'next/dynamic';

const TableSkeleton = dynamic(() => import('./TableSkeleton'), { ssr: false });
const ClientOnly = dynamic(() => import('./ClientOnly'), { ssr: false });

/**
 * Renders the table of intent data.
 */
export default function IntentTable({
    clientConnected,
    intentCreatedEvents,
    fulfilledStatuses,
    remainingTimes,
    handleItemSelect,
    ethUsdRate,
    isLoading,
}) {
  const [expandedIntent, setExpandedIntent] = useState(null);
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // If the wallet isn't connected, don't show anything
  if (!clientConnected) return null;

  const toggleExpandedIntent = (intentId) => {
    if (expandedIntent === intentId) {
      setExpandedIntent(null);
    } else {
      setExpandedIntent(intentId);
    }
  };

  const toggleInsights = () => {
    setInsightsExpanded(!insightsExpanded);
  };

  return (
    <div className="max-w-[85rem] px-2 sm:px-4 py-6 sm:py-10 lg:px-8 lg:py-14 mx-auto">
      {/* Card */}
      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-4 sm:px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">All Intents</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Latest, recent, and previous intents.</p>
                </div>

                <div className="flex justify-end">
                  <div className="inline-flex gap-x-2">
                    <a
                      className="py-2 px-3 inline-flex items-center gap-x-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700"
                      href="#"
                    >
                      View all
                    </a>

                    <a
                      className="py-2 px-3 inline-flex items-center gap-x-2 text-xs sm:text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      href="#"
                    >
                      <FilterIcon size={15}/>
                      Filter
                    </a>
                  </div>
                </div>
              </div>
              {/* End Header */}

              {/* Collapse (optional) - using React state instead of Preline */}
              <div className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <button
                  type="button"
                  className="py-3 sm:py-4 px-4 sm:px-6 w-full flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200"
                  onClick={toggleInsights}
                >
                  {insightsExpanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRightIcon className="size-4" />
                  )}
                  Insights
                </button>
                
                {insightsExpanded && (
                  <div className="pb-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="size-5 flex justify-center items-center rounded-full bg-blue-600 text-white">
                        <svg
                          className="shrink-0 size-3.5"
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
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="text-sm text-gray-800 dark:text-gray-200">
                        There are no insights for this period.
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* End Collapse */}

              <ClientOnly>
                {/* Mobile Card View */}
                <div className="sm:hidden">
                  {isLoading ? (
                    <div className="p-4 flex justify-center">
                      <div className="animate-spin size-6 border-t-2 border-blue-600 rounded-full"></div>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {intentCreatedEvents.map((intent) => {
                        // Convert Wei to Ether
                        const finalPriceInEther = Number(intent.deposit) / 10 ** 18;
                        // Convert Ether to USD
                        const finalPriceInUSD = finalPriceInEther * ethUsdRate;

                        const isIntentFulfilledValue = fulfilledStatuses?.[intent.intentId] ?? false;
                        const remainingTime = remainingTimes[intent.intentId] || 'Calculating...';

                        return (
                          <li key={intent.intentId.toString()} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                                  #{intent.intentId}
                                </span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  ${finalPriceInUSD.toFixed(2)}
                                </p>
                              </div>
                              <button 
                                onClick={() => toggleExpandedIntent(intent.intentId.toString())}
                                className="text-gray-500 dark:text-gray-400"
                              >
                                <ChevronRightIcon 
                                  size={20} 
                                  className={`transition-transform ${expandedIntent === intent.intentId.toString() ? 'rotate-90' : ''}`}
                                />
                              </button>
                            </div>
                            
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span
                                className={`py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium 
                                  ${
                                    isIntentFulfilledValue
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  } 
                                  rounded-full`}
                              >
                                {isIntentFulfilledValue ? 'Fulfilled' : 'Unfulfilled'}
                              </span>
                              <span
                                className={`py-1 px-1.5 text-xs font-medium rounded-full 
                                  ${
                                    remainingTime === 'Expired'
                                      ? 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                      : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
                                  }`}
                              >
                                {remainingTime}
                              </span>
                            </div>
                            
                            {expandedIntent === intent.intentId.toString() && (
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Created: {intent.createdAt}</p>
                                <button
                                  type="button"
                                  onClick={() => handleItemSelect(intent)}
                                  className="mt-2 py-1 px-2 inline-flex justify-center items-center gap-2 rounded-lg border dark:border-gray-700 font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm align-middle hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none text-xs"
                                >
                                  <ScanQrCodeIcon size={14} />
                                  View details
                                </button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Desktop Table View */}
                <table className="hidden sm:table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-start">
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                            Intent number
                          </span>
                        </div>
                      </th>

                      <th scope="col" className="px-6 py-3 text-start">
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                            Amount
                          </span>
                        </div>
                      </th>

                      <th scope="col" className="px-6 py-3 text-start">
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                            Status
                          </span>
                        </div>
                      </th>

                      <th scope="col" className="px-6 py-3 text-start">
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                            Due
                          </span>
                        </div>
                      </th>

                      <th scope="col" className="px-6 py-3 text-start">
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                            Created
                          </span>
                        </div>
                      </th>

                      <th scope="col" className="px-6 py-3 text-end"></th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                      <TableSkeleton />
                    ) : (
                    intentCreatedEvents.map((intent) => {
                      // Convert Wei to Ether
                      const finalPriceInEther = Number(intent.deposit) / 10 ** 18;
                      // Convert Ether to USD
                      const finalPriceInUSD = finalPriceInEther * ethUsdRate;

                      const isIntentFulfilledValue = fulfilledStatuses?.[intent.intentId] ?? false;
                      const remainingTime = remainingTimes[intent.intentId] || 'Calculating...';

                      return (
                        <tr
                          key={intent.intentId.toString()}
                          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="whitespace-nowrap">
                            <button
                              type="button"
                              className="block"
                              onClick={() => handleItemSelect(intent)}
                            >
                              <span className="block px-6 py-2">
                                <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                                  #{intent.intentId}
                                </span>
                              </span>
                            </button>
                          </td>
                          <td className="whitespace-nowrap">
                            <span className="block px-6 py-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                ${finalPriceInUSD.toFixed(2)}
                              </span>
                            </span>
                          </td>
                          <td className="whitespace-nowrap">
                            <span className="block px-6 py-2">
                              <span
                                className={`py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium 
                                  ${
                                    isIntentFulfilledValue
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  } 
                                  rounded-full`}
                              >
                                {isIntentFulfilledValue ? 'Fulfilled' : 'Unfulfilled'}
                              </span>
                            </span>
                          </td>
                          <td className="whitespace-nowrap">
                            <span className="block px-6 py-2">
                              <span
                                className={`py-1 px-1.5 text-xs font-medium rounded-full 
                                  ${
                                    remainingTime === 'Expired'
                                      ? 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                      : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
                                  }`}
                              >
                                {remainingTime}
                              </span>
                            </span>
                          </td>
                          <td className="whitespace-nowrap">
                            <span className="block px-6 py-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">{intent.createdAt}</span>
                            </span>
                          </td>
                          <td className="whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleItemSelect(intent)}
                              className="block"
                            >
                              <span className="px-6 py-1.5">
                                <span className="py-1 px-2 inline-flex justify-center items-center gap-2 rounded-lg border dark:border-gray-700 font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm align-middle hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm">
                                  <ScanQrCodeIcon size={15} />
                                  View
                                </span>
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}