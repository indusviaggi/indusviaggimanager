import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    APP_VERSION: process.env.npm_package_version || "1.0.0",
    IS_LOCAL: process.env.MONGODB_URI?.includes("italy") ? "true" : "false",
  },
  webpack: (config) => {
    config.resolve.alias["next/router"] = path.resolve(
      __dirname,
      "lib/compat/next-router.tsx"
    );
    return config;
  },
};

export default nextConfig;
