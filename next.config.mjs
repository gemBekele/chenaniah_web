/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Production domain configuration
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://chenaniah.org' : '',
  basePath: '',
  trailingSlash: false,
};

export default nextConfig;
