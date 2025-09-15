import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: './',
    rules: {},
  },
  experimental: {
    clientSegmentCache: true,
  },
};

export default nextConfig;
