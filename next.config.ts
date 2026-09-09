import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Нужно для ONREZA / Docker / PM2: runnable server.js в .next/standalone
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
};

export default nextConfig;
