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
      {
        source: "/courses",
        destination: "/src/pages/courses",
      },
      {
        source: "/calendar",
        destination: "/src/pages/calendar",
      },
      {
        source: "/schedule",
        destination: "/src/pages/schedule",
      },
      {
        source: "/settings",
        destination: "/src/pages/settings",
      },
    ];
  },
};

export default nextConfig;
