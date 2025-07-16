// next.config.js
// This file lets you customize how Next.js works for your project.
// Use it to:
// - Add environment variables or API keys (for build-time use)
// - Change how your app is built or optimized
// - Set up image domains, redirects, or rewrites
// - Enable special Next.js features
// For most projects, you can leave it as-is unless you need something special.

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            prettier: false,
            svgo: true,
            titleProp: true,
          },
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;
