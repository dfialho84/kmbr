/**
 * Service Worker — Estratégias de Cache
 *
 * Configura o Serwist com:
 * - Precache de assets estáticos (via InjectManifest no build)
 * - CacheFirst para assets imutáveis (_next/static, fontes, imagens, áudio, vídeo)
 * - NetworkFirst para assets dinâmicos (HTML, RSC, API routes)
 * - Invalidação automática de caches de versões anteriores na ativação (T-46)
 * - Limite de 50 MB com evicção FIFO via enforceCacheSizeLimit (T-52)
 *
 * Rastreabilidade: REQ-14 · REQ-20 · REQ-21 · NFR-1 · NFR-2 · NFR-4
 *                  (T-33 · T-34 · T-45 · T-46 · T-52)
 */

import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";
import type { PrecacheEntry, SerwistPlugin } from "serwist";
import { enforceCacheSizeLimit } from "./infra/sw/enforceCacheSizeLimit";

/**
 * __SW_MANIFEST é injetado pelo InjectManifest plugin do Serwist durante o build.
 * A declaração garante que o TypeScript reconheça a variável global no escopo do SW.
 */
declare const __SW_MANIFEST: (PrecacheEntry | string)[];

/**
 * Plugin personalizado que aplica o limite de 50 MB com evicção FIFO antes de
 * armazenar cada nova resposta no cache de runtime.
 *
 * Integrado nas estratégias CacheFirst e NetworkFirst via hook `cacheWillUpdate`.
 * Garante que o tamanho total de todos os caches de runtime nunca exceda 50 MB,
 * removendo as entradas mais antigas (FIFO) quando necessário.
 *
 * Rastreabilidade: NFR-4 (T-52)
 */
const cacheSizeLimitPlugin: SerwistPlugin = {
  /**
   * Executado antes de qualquer resposta ser armazenada no cache.
   * Verifica e aplica o limite de 50 MB com evicção FIFO se necessário.
   *
   * @param param.response - Resposta a ser armazenada
   * @returns A mesma resposta (sem alteração); o limite é aplicado como efeito colateral
   */
  cacheWillUpdate: async ({ response }) => {
    // Aplica o limite de 50 MB com evicção FIFO antes de adicionar novo asset.
    // A chamada é não-bloqueante para o caller: falhas são absorvidas silenciosamente
    // para não interromper o ciclo de cache (REQ-16).
    try {
      await enforceCacheSizeLimit();
    } catch {
      // Falha de controle de tamanho não deve impedir o cacheamento do asset.
      // O app continua funcional — proteção de storage é melhor-esforço.
    }
    return response;
  },
};

/**
 * Estende o defaultCache injetando o cacheSizeLimitPlugin em todas as estratégias
 * de runtime que armazenam respostas (CacheFirst, NetworkFirst, StaleWhileRevalidate).
 *
 * O plugin é adicionado como primeiro elemento do array `plugins` para garantir
 * que a verificação de tamanho ocorre antes dos demais plugins processarem a resposta.
 *
 * Rastreabilidade: NFR-4 (T-52)
 */
const runtimeCachingWithSizeLimit = defaultCache.map((entry) => {
  if (!entry.handler || typeof entry.handler === "string") {
    return entry;
  }

  // Injeta o plugin de limite de tamanho no handler existente
  const handler = entry.handler as { plugins?: SerwistPlugin[] };
  if (handler.plugins) {
    handler.plugins.unshift(cacheSizeLimitPlugin);
  }

  return entry;
});

const serwist = new Serwist({
  precacheEntries: __SW_MANIFEST,
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: runtimeCachingWithSizeLimit,
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
