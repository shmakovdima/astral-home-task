const nextConfig = {
  basePath: process.env.NODE_ENV === 'production' ? '/astral-home-task' : '',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "fastly.picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, context) => {
    if (context?.isServer) {
      if (Array.isArray(config.resolve.alias)) {
        config.resolve.alias.push({ name: "msw/browser", alias: false });
      } else {
        config.resolve.alias["msw/browser"] = false;
      }
    } else {
      if (Array.isArray(config.resolve.alias)) {
        config.resolve.alias.push({ name: "msw/node", alias: false });
      } else {
        config.resolve.alias["msw/node"] = false;
      }
    }

    return config;
  },
};

export default nextConfig;
