export const metadata = {
  title: 'Storerunner | Share',
  description: 'Order from your favorite ecommerce platforms directly onchain without having to move any funds.',
  openGraph: {
    title: 'Storerunner',
    description: 'Order from your favorite ecommerce platforms directly onchain without having to move any funds.',
    images: ['https://storerunner.xyz/sharing-image.png'],
  },
}

export default function FramePage() {
  return (
    <>
      <head>
        {/* Frame metadata using individual tags for better compatibility */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://storerunner.xyz/sharing-image.png" />
        <meta property="fc:frame:button:1" content="Open Storerunner" />
        <meta property="fc:frame:post_url" content="https://storerunner.xyz/api/farcaster/frame" />
        
        {/* Standard Open Graph tags for other platforms */}
        <meta property="og:title" content="Storerunner" />
        <meta property="og:description" content="Order from your favorite ecommerce platforms directly onchain without having to move any funds." />
        <meta property="og:image" content="https://storerunner.xyz/sharing-image.png" />
        <meta property="og:url" content="https://storerunner.xyz" />
        <meta property="og:type" content="website" />
      </head>
      
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-3xl font-bold mb-4">Storerunner</h1>
          <p className="mb-6">Order from your favorite ecommerce platforms directly onchain without having to move any funds.</p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
          >
            Go to App
          </a>
        </div>
      </div>
    </>
  )
} 