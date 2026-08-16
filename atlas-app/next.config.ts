import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/dashboard",
        destination: "/src/pages/dashboard",
      },
      {
        source: "/thevault",
        destination: "/src/pages/thevault",
      },
    ];
  },
};

export default nextConfig;
