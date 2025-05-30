// This is a server component that serves the frame page
// It exports metadata for SEO and includes Farcaster frame meta tags

export const metadata = {
  title: "Storerunner",
  description: "Order from your favorite ecommerce platforms directly onchain without having to move any funds.",
  openGraph: {
    title: "Storerunner",
    description: "Order from your favorite ecommerce platforms directly onchain without having to move any funds.",
    images: ["https://storerunner.xyz/sharing-image.png"],
    url: "https://storerunner.xyz/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Storerunner",
    description: "Order from your favorite ecommerce platforms directly onchain without having to move any funds.",
    images: ["https://storerunner.xyz/sharing-image.png"],
  },
  // Farcaster Frame metadata
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://storerunner.xyz/sharing-image.png",
    "fc:frame:button:1": "Open Storerunner",
    "fc:frame:post_url": "https://storerunner.xyz/api/farcaster/frame",
  }
}

export default function FramePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Storerunner</h1>
      <p className="text-lg mb-6 max-w-md">
        Order from your favorite ecommerce platforms directly onchain without having to move any funds.
      </p>
      <a 
        href="https://storerunner.xyz"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Open Storerunner
      </a>
    </div>
  );
} 