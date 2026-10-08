import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // App do treinador (export web do apps/mobile em public/app): URLs limpas para as páginas .html.
  // Arquivos reais (/app/_expo/..., /app/assets/...) são servidos antes destas regras.
  async rewrites() {
    return [
      { source: "/app", destination: "/app/index.html" },
      { source: "/app/:path*", destination: "/app/:path*.html" },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
