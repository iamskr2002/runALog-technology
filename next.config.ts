
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // OpenNext builds the Cloudflare Worker from the Next.js output.
  // Do not use output: "standalone" for this deployment.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["*.space-z.ai"],
};

initOpenNextCloudflareForDev();

export default nextConfig;
