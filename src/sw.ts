/**
 * Service Worker — Estratégias de Cache
 *
 * Configura o Serwist com:
 * - Precache de assets estáticos (via InjectManifest no build)
 * - CacheFirst para assets imutáveis (_next/static, fontes, imagens, áudio, vídeo)
 * - NetworkFirst para assets dinâmicos (HTML, RSC, API routes)
 * - Invalidação automática de caches de versões anteriores na ativação (T-46)
 *
 * Rastreabilidade: REQ-14 · REQ-20 · REQ-21 · NFR-1 · NFR-2 · NFR-4
 *                  (T-33 · T-34 · T-45 · T-46)
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
  precacheOptions: {
    /**
     * Habilita a limpeza automática de precaches incompatíveis de versões
     * anteriores durante o evento activate do Service Worker.
     *
     * Quando um novo SW é ativado (via SKIP_WAITING), o Serwist itera sobre
     * todos os caches existentes, identifica os que contêm '-precache-' no nome
     * (padrão de nomenclatura do Serwist para precache) e chama `caches.delete()`
     * para cada um, exceto o cache da versão atual. Isso garante que assets de
     * versões antigas não sejam servidos após a ativação do novo SW.
     *
     * A chave de cache inclui o hash/versão do build no sufixo (ex:
     * 'serwist-precache-v2-https://app.example.com/'), garantindo isolamento
     * entre versões.
     *
     * Rastreabilidade: REQ-21 · NFR-4 (T-46)
     */
    cleanupOutdatedCaches: true,
  },
});

serwist.addEventListeners();
