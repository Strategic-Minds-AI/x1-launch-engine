import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        { key: "Cache-Control", value: "no-store" },
        { key: "X-Content-Type-Options", value: "nosniff" }
      ]
    }];
  }
};
export default nextConfig;
