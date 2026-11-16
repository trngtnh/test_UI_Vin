/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static-cms-prod.vinfastauto.com',
      },
    ],
  },
};

export default nextConfig;
