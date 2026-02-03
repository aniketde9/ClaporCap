import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix lockfile warning by explicitly setting root
  turbopack: {
    root: __dirname,
  },
  // Ensure correct working directory for module resolution
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  // Ensure webpack resolves from project root
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.modules = [
        ...(config.resolve.modules || []),
        __dirname,
      ];
    }
    return config;
  },
};

export default nextConfig;
