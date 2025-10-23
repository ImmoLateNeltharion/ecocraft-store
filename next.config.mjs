/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    }
  },
  images: {
    remotePatterns: [
      { 
        protocol: 'https', 
        hostname: 'images.unsplash.com',
        pathname: '/**'
      }
    ],
    unoptimized: true
  }
}

export default nextConfig

