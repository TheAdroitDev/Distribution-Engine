import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${posthogHost}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
