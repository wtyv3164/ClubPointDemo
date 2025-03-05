/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['antd', '@ant-design/icons'],
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;