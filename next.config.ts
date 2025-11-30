import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  images: {
    unoptimized: isProd, // Only unoptimize for production
  },
  basePath: isProd ? '/corgi-butt' : '', // Only use basePath in production
  assetPrefix: isProd ? '/corgi-butt/' : '', // Only use assetPrefix in production
};

export default nextConfig;