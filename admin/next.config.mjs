/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure output is standalone for better container compatibility
  output: 'standalone',
  // Increase memory limit warnings
  experimental: {
    // This helps with memory issues in containers
    serverComponentsExternalPackages: [],
  },
}

export default nextConfig
