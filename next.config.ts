import type { NextConfig } from "next";
import data from "./lib/site-data.json";

// The old WordPress site kept blog posts at the root (/mirror-glass/). Those links live on in
// search results and social posts, so each one is sent to its new home under /blog.
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      ...data.blog.map((p) => ({ source: `/${p.slug}`, destination: `/blog/${p.slug}`, permanent: true })),
      { source: "/capabilities/:path*", destination: "/custom-orders", permanent: true },
      { source: "/feed", destination: "/blog", permanent: true },
    ];
  },
};

export default nextConfig;
