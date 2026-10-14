import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // the browser already revalidates sw.js on its own schedule, but a
        // proxy/cdn sitting in front must never hold on to an old copy or
        // users get stuck on a stale service worker
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
