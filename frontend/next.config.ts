import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  images: {
    domains: ['127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/avatars/**',
      },
    ],
  },

}

export default nextConfig