import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: false,
  experimental: {
    // React <ViewTransition> morphs (card cover → case-study banner) during client navigation.
    viewTransition: true,
  },
};

export default nextConfig;
