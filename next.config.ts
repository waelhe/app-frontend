import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // On Railway, PORT is provided via environment variable.
  // The standalone server.js reads PORT automatically.
  // No need to configure it here — Next.js standalone handles it.
};

export default nextConfig;
