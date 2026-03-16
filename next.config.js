import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
  skipTrailingSlashRedirect: true,
};

export default config;
