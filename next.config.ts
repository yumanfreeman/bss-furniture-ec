import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dbycjzweztzhmlfpnuto.supabase.co",
      },
    ],
  },
};

export default nextConfig;
