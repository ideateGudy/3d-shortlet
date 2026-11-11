/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@shortlet/shared', 'three'],
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
