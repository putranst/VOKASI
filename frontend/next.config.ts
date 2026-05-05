import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["pg", "bcryptjs"],
  },
};

export default nextConfig;
