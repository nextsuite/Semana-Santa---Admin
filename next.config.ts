import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "192.168.0.35",
    "poor-snakes-play.loca.lt",
  ],
};

export default nextConfig;
