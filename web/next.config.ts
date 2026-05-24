import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', process.env.APP_URL || ''],
    },
  },
};

export default nextConfig;
