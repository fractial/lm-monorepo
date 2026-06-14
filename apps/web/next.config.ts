import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [new URL("https://example.com/**")],
  },
}

export default nextConfig
