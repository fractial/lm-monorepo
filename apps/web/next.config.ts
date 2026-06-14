import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [
      new URL("https://example.com/**"),
      new URL("https://a.b/**"),
    ],
  },
}

export default nextConfig
