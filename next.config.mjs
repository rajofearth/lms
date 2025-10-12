/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "utfs.io",
      },
      {
        hostname: "img.clerk.com",
      },
      {
        hostname: "localhost",
      },
      {
        hostname: "assets.aceternity.com",
      },
      {
        hostname: "github.com",
      },
      {
        hostname: "avatar.vercel.sh",
      },
    ],
  },
};

export default nextConfig;
