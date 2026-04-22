import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@duckdb/duckdb-wasm"],
  turbopack: {},
  webpack: (config) => {
    config.experiments.asyncWebAssembly = true;
    return config;
  },
};

export default nextConfig;
