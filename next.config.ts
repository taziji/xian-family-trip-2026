import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: isGitHubPages ? 'export' : undefined,
  basePath: isGitHubPages ? '/xian-family-trip-2026' : undefined,
  assetPrefix: isGitHubPages ? '/xian-family-trip-2026/' : undefined,
  trailingSlash: isGitHubPages,
  images: { unoptimized: true },
};

export default nextConfig;
