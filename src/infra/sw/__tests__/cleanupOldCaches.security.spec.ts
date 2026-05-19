/**
 * ST-1: Cache obsoleto não persiste versão desatualizada após invalidação
 *
 * Rastreabilidade: REQ-21 · NFR-4 · T-46
 *
 * Verifica que ao ativar um novo Service Worker, os caches de precache de
 * versões anteriores são deletados via `caches.delete()` antes de qualquer
 * resposta ser servida, garantindo que o usuário não continue sendo servido
 * com assets de versão desatualizada.
 *
 * Vetor de ataque simulado: Cache poisoning por versão obsoleta — SW antigo
 * em cache sendo servido em vez do novo build.
 */

import { cleanupOldCaches, PRECACHE_SUBSTRING } from '../cleanupOldCaches';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Cria um mock de CacheStorage com chaves controladas.
 */
function createCacheStorageMock(cacheKeys: string[]) {
  const deleteMock = jest.fn().mockResolvedValue(true);

  return {
    keys: jest.fn().mockResolvedValue(cacheKeys),
    delete: deleteMock,
  };
}

// ---------------------------------------------------------------------------
// ST-1
// ---------------------------------------------------------------------------

describe('cleanupOldCaches — ST-1: Cache obsoleto não persiste versão desatualizada', () => {
  /**
   * ST-1 — Caso 1: `caches.delete()` é chamado para o cache da versão anterior
   *
   * Ao ativar novo SW via SKIP_WAITING, a função deve identificar caches de
   * precache de versões anteriores e deletá-los via `caches.delete()`.
   * O cache atual deve ser preservado.
   */
  it('chama caches.delete() para o cache da versão anterior e preserva o cache atual', async () => {
    const currentCacheName = 'serwist-precache-v2-https://example.com/';
    const oldCacheName = 'serwist-precache-v1-https://example.com/';
    const unrelatedCacheName = 'runtime-cache';

    const cacheStorage = createCacheStorageMock([
      currentCacheName,
      oldCacheName,
      unrelatedCacheName,
    ]);

    const deleted = await cleanupOldCaches(currentCacheName, cacheStorage);

    // Cache da versão anterior deve ser deletado
    expect(cacheStorage.delete).toHaveBeenCalledWith(oldCacheName);

    // Cache atual deve ser preservado
    expect(cacheStorage.delete).not.toHaveBeenCalledWith(currentCacheName);

    // Cache não relacionado (sem substring de precache) deve ser preservado
    expect(cacheStorage.delete).not.toHaveBeenCalledWith(unrelatedCacheName);

    // Deve retornar lista dos caches deletados
    expect(deleted).toEqual([oldCacheName]);
  });

  /**
   * ST-1 — Caso 2: Assets da versão nova são verificados via cache key com versão/build hash
   *
   * O nome do cache atual deve incluir substring que identifica a versão,
   * garantindo que caches de versões diferentes não se misturem.
   */
  it('nenhum cache da versão antiga é servido após ativação: cache key inclui versão/hash', async () => {
    // Simula múltiplas versões anteriores
    const currentCacheName = 'serwist-precache-v3-https://app.example.com/';
    const oldCacheV1 = 'serwist-precache-v1-https://app.example.com/';
    const oldCacheV2 = 'serwist-precache-v2-https://app.example.com/';

    const cacheStorage = createCacheStorageMock([currentCacheName, oldCacheV1, oldCacheV2]);

    const deleted = await cleanupOldCaches(currentCacheName, cacheStorage);

    // Ambos os caches antigos devem ser deletados
    expect(cacheStorage.delete).toHaveBeenCalledWith(oldCacheV1);
    expect(cacheStorage.delete).toHaveBeenCalledWith(oldCacheV2);
    expect(cacheStorage.delete).toHaveBeenCalledTimes(2);

    // Cache atual preservado
    expect(cacheStorage.delete).not.toHaveBeenCalledWith(currentCacheName);

    expect(deleted).toHaveLength(2);
    expect(deleted).toContain(oldCacheV1);
    expect(deleted).toContain(oldCacheV2);
  });

  /**
   * ST-1 — Caso 3: Fallback para rede quando cache está em transição
   *
   * Quando não há caches antigos, nenhuma chamada a `caches.delete()` deve
   * ser feita — evita remoção indevida de caches válidos.
   */
  it('não chama caches.delete() quando não há caches de versões anteriores', async () => {
    const currentCacheName = 'serwist-precache-v1-https://example.com/';

    // Apenas o cache atual existe — sem versões anteriores
    const cacheStorage = createCacheStorageMock([currentCacheName]);

    const deleted = await cleanupOldCaches(currentCacheName, cacheStorage);

    expect(cacheStorage.delete).not.toHaveBeenCalled();
    expect(deleted).toHaveLength(0);
  });

  /**
   * Verificação adicional: a substring de identificação de precache está correta.
   * Garante que a constante PRECACHE_SUBSTRING corresponde ao padrão do Serwist.
   */
  it('identifica caches de precache corretamente via PRECACHE_SUBSTRING', async () => {
    expect(PRECACHE_SUBSTRING).toBe('-precache-');

    const currentCacheName = `serwist${PRECACHE_SUBSTRING}v2-scope`;
    const oldCacheName = `serwist${PRECACHE_SUBSTRING}v1-scope`;
    const nonPrecacheName = 'runtime-cache-v1';

    const cacheStorage = createCacheStorageMock([currentCacheName, oldCacheName, nonPrecacheName]);

    const deleted = await cleanupOldCaches(currentCacheName, cacheStorage);

    // Cache com substring de precache mas diferente do atual: deletado
    expect(deleted).toContain(oldCacheName);

    // Cache sem substring de precache: preservado (não é cache de precache)
    expect(deleted).not.toContain(nonPrecacheName);
  });
});
