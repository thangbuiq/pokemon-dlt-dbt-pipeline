import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  serverExternalPackages: ['@duckdb/duckdb-wasm'],
  turbopack: {},
  webpack: (config) => {
    config.experiments.asyncWebAssembly = true
    return config
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokéAPI/sprites/master/**',
      },
    ],
  },
}

export default nextConfig
