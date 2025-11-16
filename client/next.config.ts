import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com", "lh3.googleusercontent.com"],
  },
  // Transpile Better Auth package
  transpilePackages: ["better-auth"],
  webpack: (config) => {
    // Force Webpack to use CommonJS version of Better Auth React build
    config.resolve.alias = {
      ...config.resolve.alias,
      "better-auth/react$": path.resolve(
        __dirname,
        "node_modules/better-auth/dist/client/react/index.cjs"
      ),
    };
    return config;
  },
};

export default nextConfig;
