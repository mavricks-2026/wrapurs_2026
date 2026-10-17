/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Silence the "multiple lockfiles" warning when a parent folder has a lockfile.
  outputFileTracingRoot: process.cwd(),
  images: {
    // Local design assets live in /public/images. Remote patterns are here
    // so you can later point straight at Cloudinary / S3 without code changes.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;
