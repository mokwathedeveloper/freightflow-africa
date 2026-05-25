import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['ws', '@neondatabase/serverless', '@prisma/adapter-neon'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', process.env.APP_URL || ''],
    },
  },
};

export default nextConfig;
