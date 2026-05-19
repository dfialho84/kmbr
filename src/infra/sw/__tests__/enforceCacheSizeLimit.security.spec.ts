/**
 * ST-2: Crescimento irrestrito de cache não compromete storage do dispositivo
 *
 * Rastreabilidade: NFR-4 · T-52
 *
 * Verifica que o sistema aplica o limite máximo de cache (50 MB) e executa
 * limpeza automática antes de excedê-lo, protegendo o storage do dispositivo.
 *
 * Vetor de ataque simulado: Esgotamento de storage por acúmulo de versões de
 * cache — múltiplas atualizações de versão sem limpeza automática.
 *
 * Casos cobertos:
 *   - Cache abaixo do limite: nenhuma limpeza é disparada
 *   - Cache atinge o limite de 50 MB: limpeza FIFO executada automaticamente
 *   - Após limpeza: tamanho total permanece abaixo do limite
 *   - `caches.delete()` é chamado para caches de versões anteriores
 */

import {
  enforceCacheSizeLimit,
  CACHE_SIZE_LIMIT_BYTES,
  type CacheStorageApi,
  type CacheApi,
} from '../enforceCacheSizeLimit';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MB = 1024 * 1024;

/**
 * Cria um mock de Response com tamanho em bytes controlado.
 */
function createResponseMock(sizeBytes: number, dateIso?: string): Response {
  const headers = new Headers();
  headers.set('content-length', String(sizeBytes));
  if (dateIso) {
    headers.set('date', dateIso);
  }
  return {
    headers,
    clone: jest.fn().mockReturnThis(),
    blob: jest.fn().mockResolvedValue(new Blob(['x'.repeat(sizeBytes)])),
  } as unknown as Response;
}

/**
 * Cria um mock de Request com URL controlada.
 */
function createRequestMock(url: string): Request {
  return { url } as Request;
}

/**
 * Cria um mock de Cache com entradas controladas.
 */
function createCacheMock(
  entries: Array<{ url: string; sizeBytes: number; dateIso?: string }>,
): CacheApi & { _deletedKeys: string[] } {
  const deletedKeys: string[] = [];
  const entryMap = new Map(
    entries.map((e) => [e.url, createResponseMock(e.sizeBytes, e.dateIso)]),
  );

  return {
    _deletedKeys: deletedKeys,
    keys: jest.fn().mockResolvedValue(entries.map((e) => createRequestMock(e.url))),
    match: jest.fn().mockImplementation((req: Request | string) => {
      const url = typeof req === 'string' ? req : req.url;
      return Promise.resolve(entryMap.get(url));
    }),
    delete: jest.fn().mockImplementation((req: Request | string) => {
      const url = typeof req === 'string' ? req : req.url;
      deletedKeys.push(url);
      entryMap.delete(url);
      return Promise.resolve(true);
    }),
  };
}

/**
 * Cria um mock de CacheStorage com múltiplos caches.
 */
function createCacheStorageMock(
  caches: Record<string, ReturnType<typeof createCacheMock>>,
): CacheStorageApi & { _cacheInstances: typeof caches } {
  return {
    _cacheInstances: caches,
    keys: jest.fn().mockResolvedValue(Object.keys(caches)),
    open: jest.fn().mockImplementation((name: string) => Promise.resolve(caches[name])),
    delete: jest.fn().mockResolvedValue(true),
  };
}

// ---------------------------------------------------------------------------
// ST-2
// ---------------------------------------------------------------------------

describe('enforceCacheSizeLimit — ST-2: Crescimento irrestrito de cache não compromete storage', () => {
  /**
   * ST-2 — Caso 1: Cache abaixo do limite
   *
   * Quando o tamanho total dos caches está abaixo de 50 MB, nenhuma limpeza
   * deve ser disparada. O resultado deve indicar que não houve execução.
   */
  it('não executa limpeza quando cache está abaixo do limite de 50 MB', async () => {
    // Tamanho total: 10 MB — bem abaixo do limite de 50 MB
    const runtimeCache = createCacheMock([
      {
        url: 'https://app.example.com/_next/static/css/main.css',
        sizeBytes: 5 * MB,
        dateIso: '2024-01-01T00:00:00Z',
      },
      {
        url: 'https://app.example.com/_next/static/js/app.js',
        sizeBytes: 5 * MB,
        dateIso: '2024-01-01T01:00:00Z',
      },
    ]);

    const cacheStorage = createCacheStorageMock({ 'runtime-cache': runtimeCache });

    const result = await enforceCacheSizeLimit(cacheStorage);

    // Nenhuma limpeza deve ser executada
    expect(result.cleanupExecuted).toBe(false);
    expect(result.entriesRemoved).toBe(0);
    expect(result.totalSizeBefore).toBe(10 * MB);
    expect(result.totalSizeAfter).toBe(10 * MB);

    // delete não deve ter sido chamado
    expect(runtimeCache.delete).not.toHaveBeenCalled();
  });

  /**
   * ST-2 — Caso 2: Cache atinge o limite de 50 MB — limpeza FIFO executada
   *
   * Quando o tamanho total dos caches excede 50 MB, a limpeza FIFO deve ser
   * executada automaticamente, removendo as entradas mais antigas primeiro.
   */
  it('executa limpeza FIFO quando cache atinge o limite de 50 MB', async () => {
    // Total: 60 MB — 10 MB acima do limite
    // Entradas ordenadas por timestamp (mais antiga primeiro = FIFO)
    const runtimeCache = createCacheMock([
      {
        url: 'https://app.example.com/_next/static/css/old.css',
        sizeBytes: 20 * MB,
        dateIso: '2024-01-01T00:00:00Z', // mais antiga — deve ser removida primeiro
      },
      {
        url: 'https://app.example.com/_next/static/js/new.js',
        sizeBytes: 20 * MB,
        dateIso: '2024-01-02T00:00:00Z', // intermediária
      },
      {
        url: 'https://app.example.com/_next/static/js/newest.js',
        sizeBytes: 20 * MB,
        dateIso: '2024-01-03T00:00:00Z', // mais nova — deve ser preservada
      },
    ]);

    const cacheStorage = createCacheStorageMock({ 'runtime-cache': runtimeCache });

    const result = await enforceCacheSizeLimit(cacheStorage);

    // Limpeza deve ter sido executada
    expect(result.cleanupExecuted).toBe(true);
    expect(result.totalSizeBefore).toBe(60 * MB);

    // Após remoção do asset mais antigo (20 MB), o total fica em 40 MB (abaixo de 50 MB)
    expect(result.totalSizeAfter).toBeLessThanOrEqual(CACHE_SIZE_LIMIT_BYTES);
    expect(result.entriesRemoved).toBeGreaterThanOrEqual(1);

    // A entrada mais antiga deve ter sido removida primeiro (FIFO)
    expect(runtimeCache.delete).toHaveBeenCalledWith(
      'https://app.example.com/_next/static/css/old.css',
    );
  });

  /**
   * ST-2 — Caso 3: Tamanho após limpeza permanece abaixo do limite
   *
   * Após a execução da limpeza FIFO, o tamanho total dos caches deve
   * permanecer abaixo do limite de 50 MB.
   */
  it('tamanho total após limpeza permanece abaixo do limite de 50 MB', async () => {
    // Total: 80 MB — precisa remover múltiplas entradas para chegar abaixo de 50 MB
    const runtimeCache = createCacheMock([
      {
        url: 'https://app.example.com/asset-v1.css',
        sizeBytes: 15 * MB,
        dateIso: '2024-01-01T00:00:00Z',
      },
      {
        url: 'https://app.example.com/asset-v2.css',
        sizeBytes: 15 * MB,
        dateIso: '2024-01-02T00:00:00Z',
      },
      {
        url: 'https://app.example.com/asset-v3.js',
        sizeBytes: 20 * MB,
        dateIso: '2024-01-03T00:00:00Z',
      },
      {
        url: 'https://app.example.com/asset-v4.js',
        sizeBytes: 30 * MB,
        dateIso: '2024-01-04T00:00:00Z',
      },
    ]);

    const cacheStorage = createCacheStorageMock({ 'runtime-cache': runtimeCache });

    const result = await enforceCacheSizeLimit(cacheStorage);

    // Tamanho após limpeza deve estar abaixo do limite
    expect(result.totalSizeAfter).toBeLessThanOrEqual(CACHE_SIZE_LIMIT_BYTES);
    expect(result.cleanupExecuted).toBe(true);

    // Pelo menos 2 entradas devem ter sido removidas (15 + 15 = 30 MB removidos → 50 MB restantes)
    expect(result.entriesRemoved).toBeGreaterThanOrEqual(2);
  });

  /**
   * ST-2 — Caso 4: `caches.delete()` por entradas individuais ao atingir limite
   *
   * Ao atingir o limite, a limpeza remove entradas individuais dos caches
   * usando `cache.delete()`. Verifica que o comportamento FIFO está correto
   * ao trabalhar com múltiplos caches.
   */
  it('chama cache.delete() para entradas individuais ao atingir o limite', async () => {
    // 55 MB total em dois caches — entry1 é mais antiga e deve ser removida
    const staticCache = createCacheMock([
      {
        url: 'https://app.example.com/font-old.woff2',
        sizeBytes: 10 * MB,
        dateIso: '2024-01-01T00:00:00Z', // mais antiga
      },
    ]);

    const runtimeCache = createCacheMock([
      {
        url: 'https://app.example.com/api/data-new.json',
        sizeBytes: 45 * MB,
        dateIso: '2024-01-02T00:00:00Z', // mais nova
      },
    ]);

    const cacheStorage = createCacheStorageMock({
      'static-assets': staticCache,
      'runtime-cache': runtimeCache,
    });

    const result = await enforceCacheSizeLimit(cacheStorage);

    // Total era 55 MB — deve ter removido a entrada mais antiga (10 MB) para chegar em 45 MB
    expect(result.cleanupExecuted).toBe(true);
    expect(result.totalSizeAfter).toBeLessThanOrEqual(CACHE_SIZE_LIMIT_BYTES);

    // A entrada mais antiga (font-old.woff2, 10 MB) deve ter sido removida via cache.delete()
    expect(staticCache.delete).toHaveBeenCalledWith('https://app.example.com/font-old.woff2');

    // A entrada mais nova não deve ter sido removida (ficou abaixo do limite após remover a antiga)
    expect(runtimeCache.delete).not.toHaveBeenCalled();
  });

  /**
   * Verificação adicional: constante CACHE_SIZE_LIMIT_BYTES está correta
   *
   * Garante que o limite de 50 MB está definido corretamente em bytes.
   */
  it('define CACHE_SIZE_LIMIT_BYTES como 50 MB (52428800 bytes)', () => {
    expect(CACHE_SIZE_LIMIT_BYTES).toBe(50 * 1024 * 1024);
    expect(CACHE_SIZE_LIMIT_BYTES).toBe(52428800);
  });
});
