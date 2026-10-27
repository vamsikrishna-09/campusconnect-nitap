/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com", "api.dicebear.com"],
  },
  experimental: {
    outputFileTracingIncludes: {
      "/**": ["./prisma/dev.db", "./dev.db"],
    },
  },
};

export default nextConfig;
