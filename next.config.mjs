/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/guide/:path*',
        destination: '/how-we-grow/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
