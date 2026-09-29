/** @type {import('next').NextConfig} */

// Server actions принимают запросы только с этих хостов.
// Берём хост из NEXT_PUBLIC_SITE_URL, чтобы не хардкодить домен.
function siteHost() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').host
  } catch {
    return 'localhost:3000'
  }
}

const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: Array.from(new Set(['localhost:3000', siteHost()]))
    }
  },
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.js'
  }
}

export default nextConfig
