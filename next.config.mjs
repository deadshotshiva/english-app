/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add this for local network access
  async rewrites() {
    return []
  },
  // Configure for local network access
  experimental: {
    serverComponentsExternalPackages: [],
  },
}

export default nextConfig
