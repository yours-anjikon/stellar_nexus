import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker standalone builds — reduces image 500MB → ~150MB
  output: "standalone",

  images: {
    remotePatterns: [
      // Google OAuth avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // MinIO dev / R2 prod bucket assets
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/brandblitz/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "9000",
        pathname: "/brandblitz/**",
      },
      {
        protocol: "https",
        hostname: "assets.brandblitz.app",
        pathname: "/brandblitz/**",
      },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "brandblitz.app"],
    },
  },
};

export default nextConfig;
