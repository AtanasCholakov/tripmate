import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Игнорира TypeScript грешките при build
  },
  eslint: {
    ignoreDuringBuilds: true, // Опционално: Игнорира и ESLint грешки при build
  },
};

export default nextConfig;
