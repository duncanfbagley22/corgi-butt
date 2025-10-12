import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static exports for GitHub Pages
  images: {
    unoptimized: true, // Required for static export
  },
  basePath: '/corgi-butt', // Replace with your actual repo name
  assetPrefix: '/corgi-butt/', // Replace with your actual repo name
};

export default nextConfig;