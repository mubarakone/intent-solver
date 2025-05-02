'use client'

export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">You are offline</h1>
      <p className="mb-8">Please check your internet connection and try again.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
} 