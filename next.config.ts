import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable hostname detection to avoid network interface errors
  experimental: {
    // @ts-ignore
    disableHostnameDetection: true,
  },
};

export default nextConfig;
