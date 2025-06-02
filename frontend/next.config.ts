import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'http://127.0.0.1:8000',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
