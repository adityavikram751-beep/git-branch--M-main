import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",

      // ✅ S3 DOMAIN
      "barber-syndicate.s3.eu-north-1.amazonaws.com",
    ],
  },
};

export default nextConfig;