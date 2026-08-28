import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // o caminho da ficha é montado em runtime, então o tracing não o enxerga
  // sozinho — sem isto ela não vai no bundle e a semente do Redis some
  outputFileTracingIncludes: {
    "/**": ["./data/character.json"],
  },
  /* config options here */
};

export default nextConfig;
