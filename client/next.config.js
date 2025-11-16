const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["better-auth"],
  webpack: (config) => {
    // Force CommonJS version of Better Auth React build
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

module.exports = nextConfig;
