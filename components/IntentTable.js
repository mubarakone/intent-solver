'use client';

import React from 'react';
import { ScanQrCodeIcon, FilterIcon } from 'lucide-react';

import TableSkeleton from './TableSkeleton'

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
  // If the wallet isn't connected, don't show anything
  if (!clientConnected) return null;

  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      {/* Card */}
      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">All Intents</h2>
                  <p className="text-sm text-gray-600">Latest, recent, and previous intents.</p>
                </div>

                <div>
                  <div className="inline-flex gap-x-2">
                    <a
                      className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      href="#"
                    >
                      View all
                    </a>

                    <a
                      className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      href="#"
                    >
                      <FilterIcon size={15}/>
                      Filter
                    </a>
                  </div>
                </div>
              </div>
              {/* End Header */}

              {/* Collapse (optional) */}
              <div className="border-b border-gray-200 hover:bg-gray-50">
                <button
                  type="button"
                  className="hs-collapse-toggle py-4 px-6 w-full flex items-center gap-2 font-semibold text-gray-800"
                  id="hs-as-table"
                  aria-expanded="false"
                  aria-controls="hs-as-table-label"
                  data-hs-collapse="#hs-as-table-label"
                >
                  <svg
                    className="hs-collapse-open:rotate-90 size-4"
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
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  Insights
                </button>
                <div
                  id="hs-as-table-label"
                  className="hs-collapse hidden w-full overflow-hidden transition-[height] duration-300"
                  aria-labelledby="hs-as-table"
                >
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
                      <span className="text-sm text-gray-800">
                        There are no insights for this period.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* End Collapse */}

              {/* Table */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                          Intent number
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                          Amount
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                          Status
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                          Due
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-start">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                          Created
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-end"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
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
                        className="bg-white hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap">
                          <button
                            type="button"
                            className="block"
                            onClick={() => handleItemSelect(intent)}
                          >
                            <span className="block px-6 py-2">
                              <span className="font-mono text-sm text-blue-600">
                                #{intent.intentId}
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="whitespace-nowrap">
                          <span className="block px-6 py-2">
                            <span className="text-sm text-gray-600">
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
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
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
                                    ? 'bg-gray-300 text-gray-700'
                                    : 'bg-cyan-100 text-cyan-800'
                                }`}
                            >
                              {remainingTime}
                            </span>
                          </span>
                        </td>
                        <td className="whitespace-nowrap">
                          <span className="block px-6 py-2">
                            <span className="text-sm text-gray-600">{intent.createdAt}</span>
                          </span>
                        </td>
                        <td className="whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleItemSelect(intent)}
                            className="block"
                          >
                            <span className="px-6 py-1.5">
                              <span className="py-1 px-2 inline-flex justify-center items-center gap-2 rounded-lg border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm">
                                <ScanQrCodeIcon size={15} />
                                View
                              </span>
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
              {/* End Table */}

              {/* Footer */}
              <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">{intentCreatedEvents.length}</span> results
                  </p>
                </div>

                <div>
                  <div className="inline-flex gap-x-2">
                    <button
                      type="button"
                      className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
              {/* End Footer */}
            </div>
          </div>
        </div>
      </div>
      {/* End Card */}
    </div>
  );
}