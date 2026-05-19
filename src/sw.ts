/**
 * Service Worker — Estratégias de Cache
 *
 * Configura o Serwist com:
 * - Precache de assets estáticos (via InjectManifest no build)
 * - CacheFirst para assets imutáveis (_next/static, fontes, imagens, áudio, vídeo)
 * - NetworkFirst para assets dinâmicos (HTML, RSC, API routes)
 *
 * Rastreabilidade: REQ-14 · REQ-20 · NFR-1 · NFR-2 (T-33 · T-34 · T-45)
 */

import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";
import type { PrecacheEntry } from "serwist";

/**
 * __SW_MANIFEST é injetado pelo InjectManifest plugin do Serwist durante o build.
 * A declaração garante que o TypeScript reconheça a variável global no escopo do SW.
 */
declare const __SW_MANIFEST: (PrecacheEntry | string)[];

const serwist = new Serwist({
  precacheEntries: __SW_MANIFEST,
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
