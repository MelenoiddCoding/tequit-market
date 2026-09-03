import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  typedRoutes: false,
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.tequit.mx" }],
        destination: "https://tequit.mx/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "tequit-market.vercel.app" }],
        destination: "https://tequit.mx/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
