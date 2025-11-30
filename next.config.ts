import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  images: {
    unoptimized: isProd, // Only unoptimize for production
  }
};

export default nextConfig;