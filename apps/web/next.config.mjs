/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@shortlet/shared', 'three'],
  webpack: (config) => {
    config.cache = false;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
