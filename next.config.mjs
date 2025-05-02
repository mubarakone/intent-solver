/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

// Configure PWA
const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
};

// Create Next.js config
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone'
};

// Export the config with PWA enhancement
export default withPWA(pwaConfig)(nextConfig);
