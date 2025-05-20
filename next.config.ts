import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://www.dazzlerr.com/wp-content/uploads/**')],
  },
};

export default nextConfig;
