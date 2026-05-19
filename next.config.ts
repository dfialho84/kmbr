import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

/**
 * Integração do Serwist (PWA) com Next.js.
 *
 * swSrc: arquivo de entrada do Service Worker (compilado via webpack)
 * swDest: arquivo de saída publicado em /public/sw.js
 * disable: desativa o SW em desenvolvimento (evita conflitos com HMR)
 *
 * Rastreabilidade: REQ-14 · REQ-20 · NFR-1 (T-33 · T-45)
 */
const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {};

export default withSerwist(nextConfig);
