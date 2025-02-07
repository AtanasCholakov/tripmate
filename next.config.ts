import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Игнорира TypeScript грешките при build
  },
};

export default nextConfig;
