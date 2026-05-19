/**
 * Utilitário de controle de tamanho de cache com evicção FIFO.
 *
 * Verifica se o tamanho total dos caches de runtime excede o limite configurado
 * e, se exceder, remove as entradas mais antigas (FIFO) até que o tamanho fique
 * abaixo do limite.
 *
 * O limite de 50 MB é definido pelo NFR-4. A estratégia FIFO garante que assets
 * mais antigos são removidos primeiro, preservando os mais recentes que têm maior
 * probabilidade de serem acessados novamente.
 *
 * Rastreabilidade: NFR-4 (T-52)
 */

/**
 * Limite máximo de tamanho total dos caches em bytes (50 MB).
 * Rastreabilidade: NFR-4
 */
export const CACHE_SIZE_LIMIT_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Representa uma entrada de cache com informações de tamanho e timestamp.
 */
export interface CacheEntry {
  /** Nome do cache onde a entrada está armazenada */
  cacheName: string;
  /** URL da requisição cacheada */
  url: string;
  /** Tamanho em bytes da resposta cacheada */
  sizeBytes: number;
  /** Timestamp de quando a entrada foi adicionada ao cache (ms desde epoch) */
  timestamp: number;
}

/**
 * Resultado da operação de controle de tamanho.
 */
export interface EnforceCacheSizeLimitResult {
  /** Tamanho total antes da limpeza (bytes) */
  totalSizeBefore: number;
  /** Tamanho total após a limpeza (bytes) */
  totalSizeAfter: number;
  /** Número de entradas removidas */
  entriesRemoved: number;
  /** Indica se a limpeza foi executada (tamanho estava acima do limite) */
  cleanupExecuted: boolean;
}

/**
 * Interface parcial de CacheStorage necessária para os testes.
 */
export interface CacheStorageApi {
  keys(): Promise<string[]>;
  open(cacheName: string): Promise<CacheApi>;
  delete(cacheName: string): Promise<boolean>;
}

/**
 * Interface parcial de Cache necessária para os testes.
 */
export interface CacheApi {
  keys(): Promise<Request[]>;
  match(request: Request | string): Promise<Response | undefined>;
  delete(request: Request | string): Promise<boolean>;
}

/**
 * Calcula o tamanho em bytes de uma resposta HTTP.
 * Usa o header `content-length` quando disponível; caso contrário,
 * clona e lê o blob para obter o tamanho real.
 *
 * @param response - Resposta HTTP a ser medida
 * @returns Tamanho em bytes (0 se não puder ser determinado)
 */
export async function getResponseSizeBytes(response: Response): Promise<number> {
  const contentLength = response.headers.get('content-length');
  if (contentLength !== null) {
    const parsed = parseInt(contentLength, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  // Clona para não consumir o body original
  try {
    const clone = response.clone();
    const blob = await clone.blob();
    return blob.size;
  } catch {
    return 0;
  }
}

/**
 * Coleta todas as entradas dos caches especificados com seus tamanhos.
 * Usa o header `date` da resposta como proxy de timestamp FIFO.
 * Quando o header `date` não está disponível, usa 0 (mais antigo).
 *
 * @param cacheNames - Lista de nomes de caches a inspecionar
 * @param cacheStorage - Implementação de CacheStorage
 * @returns Lista de entradas ordenadas por timestamp (mais antigo primeiro)
 */
export async function collectCacheEntries(
  cacheNames: string[],
  cacheStorage: CacheStorageApi,
): Promise<CacheEntry[]> {
  const entries: CacheEntry[] = [];

  for (const cacheName of cacheNames) {
    const cache = await cacheStorage.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (!response) continue;

      const sizeBytes = await getResponseSizeBytes(response);

      // Usa o header Date como timestamp FIFO — quando ausente, assume época (mais antigo)
      const dateHeader = response.headers.get('date');
      const timestamp = dateHeader ? new Date(dateHeader).getTime() : 0;

      entries.push({
        cacheName,
        url: request.url,
        sizeBytes,
        timestamp,
      });
    }
  }

  // Ordena por timestamp crescente (mais antigo primeiro = FIFO)
  return entries.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Verifica o tamanho total dos caches e executa evicção FIFO se necessário.
 *
 * Algoritmo:
 * 1. Coleta todas as entradas com seus tamanhos
 * 2. Calcula o tamanho total
 * 3. Se total > limite: remove as entradas mais antigas (FIFO) até ficar abaixo
 * 4. Retorna resultado da operação
 *
 * @param cacheStorage - Implementação de CacheStorage (padrão: `caches` global)
 * @param limitBytes - Limite máximo em bytes (padrão: CACHE_SIZE_LIMIT_BYTES = 50 MB)
 * @returns Resultado da operação de controle de tamanho
 *
 * @example
 * // Chamado antes de adicionar novos assets ao cache:
 * self.addEventListener('fetch', (event) => {
 *   event.waitUntil(
 *     enforceCacheSizeLimit().then(() => {
 *       // prossegue com o fetch e cache
 *     })
 *   );
 * });
 */
export async function enforceCacheSizeLimit(
  cacheStorage: CacheStorageApi = caches as unknown as CacheStorageApi,
  limitBytes: number = CACHE_SIZE_LIMIT_BYTES,
): Promise<EnforceCacheSizeLimitResult> {
  const cacheNames = await cacheStorage.keys();
  const entries = await collectCacheEntries(cacheNames, cacheStorage);

  const totalSizeBefore = entries.reduce((sum, e) => sum + e.sizeBytes, 0);

  if (totalSizeBefore <= limitBytes) {
    // Abaixo do limite — nenhuma limpeza necessária
    return {
      totalSizeBefore,
      totalSizeAfter: totalSizeBefore,
      entriesRemoved: 0,
      cleanupExecuted: false,
    };
  }

  // Acima do limite — remove entradas FIFO (mais antigas primeiro) até ficar abaixo
  let currentSize = totalSizeBefore;
  let entriesRemoved = 0;

  for (const entry of entries) {
    if (currentSize <= limitBytes) break;

    const cache = await cacheStorage.open(entry.cacheName);
    const deleted = await cache.delete(entry.url);

    if (deleted) {
      currentSize -= entry.sizeBytes;
      entriesRemoved++;
    }
  }

  return {
    totalSizeBefore,
    totalSizeAfter: currentSize,
    entriesRemoved,
    cleanupExecuted: true,
  };
}
