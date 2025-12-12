import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure API routes use Node.js runtime (not Edge) for external API calls
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
