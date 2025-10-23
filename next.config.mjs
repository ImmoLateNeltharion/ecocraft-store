/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    }
  },
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.js'
  }
}

export default nextConfig

