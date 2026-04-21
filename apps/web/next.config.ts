import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net"
      },
      {
        protocol: "https",
        hostname: "downloads.ctfassets.net"
      }
    ]
  },
  turbopack: {
    root: path.join(process.cwd(), "../..")
  }
};

export default nextConfig;
