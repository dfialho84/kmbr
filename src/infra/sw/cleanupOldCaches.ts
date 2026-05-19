/**
 * Utilitário de limpeza de caches de versões anteriores do Service Worker.
 *
 * Deleta caches de precache de versões anteriores durante a ativação de um
 * novo Service Worker. O cache atual (identificado por `currentCacheName`)
 * é preservado; os demais que contenham a substring `-precache-` e o scope
 * do registro são removidos via `caches.delete()`.
 *
 * Rastreabilidade: REQ-21 · NFR-4 (T-46)
 */

/**
 * Substring usada pelo Serwist para nomear caches de precache.
 * Caches que contenham essa substring são candidatos à limpeza.
 */
export const PRECACHE_SUBSTRING = '-precache-';

/**
 * Remove todos os caches de versões anteriores do precache do Serwist.
 *
 * @param currentCacheName - Nome do cache atual (será preservado)
 * @param cacheStorage - Implementação de CacheStorage (padrão: `caches` global)
 * @returns Lista dos nomes de cache deletados
 *
 * @example
 * // Chamado no evento activate do Service Worker:
 * self.addEventListener('activate', (event) => {
 *   event.waitUntil(
 *     cleanupOldCaches(currentCacheName, self.caches)
 *   );
 * });
 */
export async function cleanupOldCaches(
  currentCacheName: string,
  cacheStorage: Pick<CacheStorage, 'keys' | 'delete'> = caches,
): Promise<string[]> {
  const allCacheNames = await cacheStorage.keys();

  const cacheNamesToDelete = allCacheNames.filter(
    (cacheName) =>
      cacheName.includes(PRECACHE_SUBSTRING) && cacheName !== currentCacheName,
  );

  await Promise.all(cacheNamesToDelete.map((cacheName) => cacheStorage.delete(cacheName)));

  return cacheNamesToDelete;
}
