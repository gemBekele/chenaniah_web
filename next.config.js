/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: '',
  basePath: '',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizeCss: false,
  },
};

module.exports = nextConfig;
