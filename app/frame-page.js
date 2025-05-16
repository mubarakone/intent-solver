// This is a server component that exports metadata for SEO and Farcaster frames

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
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://storerunner.xyz/sharing-image.png",
    "fc:frame:button:1": "Open Storerunner",
    "fc:frame:post_url": "https://storerunner.xyz/api/farcaster/frame",
  }
}

// Export a default component that serves as the frame page
export default function FramePage() {
  // This server component doesn't render anything directly but enables metadata
  return null;
} 