import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the tracing root so the sibling ~/package-lock.json doesn't get
  // mistaken for this project's workspace root (Termux home is a multi-repo dir).
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default nextConfig;
