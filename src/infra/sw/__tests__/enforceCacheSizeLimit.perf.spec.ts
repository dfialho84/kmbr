/**
 * PT-3: Limpeza automática de cache — operação concluída em ≤ 2000ms
 *
 * Rastreabilidade: NFR-4 · T-53
 *
 * Mede o tempo de execução da operação de limpeza de cache FIFO com Cache API
 * mockado contendo volumes variados de entradas (50, 100 e 200 entradas).
 * O benchmark executa 20 iterações por volume e verifica que todas as medições
 * ficam abaixo do threshold de 2000ms.
 *
 * Método de medição: `performance.mark` / `performance.measure` via
 * `performance.now()` para calcular duração de cada iteração.
 */

import {
  enforceCacheSizeLimit,
  CACHE_SIZE_LIMIT_BYTES,
  type CacheStorageApi,
  type CacheApi,
} from '../enforceCacheSizeLimit';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Threshold máximo permitido para a operação de limpeza (ms). Rastreabilidade: NFR-4 */
const THRESHOLD_MS = 2000;

/** Número de iterações por volume. Rastreabilidade: PT-3 (20 execuções) */
const ITERATIONS = 20;

/** Tamanho de cada entrada simulada (1 MB) */
const MB = 1024 * 1024;

/** Tamanho de cada entrada individual nos mocks — fixado em 1 MB para simplificar o cálculo */
const ENTRY_SIZE_BYTES = 1 * MB;

/**
 * Tamanho total inicial acima do limite para forçar a execução da limpeza FIFO.
 * Para N entradas de 1 MB cada, com N > 50, o total excede 50 MB.
 * Apenas volumes acima de 50 entradas acionam a limpeza — os volumes menores
 * exercitam o caminho de coleta sem limpeza.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Cria um mock de Response com tamanho em bytes controlado via header content-length.
 * O header Date usa timestamps distintos para garantir ordenação FIFO correta.
 */
function createResponseMock(sizeBytes: number, dateIso: string): Response {
  const headers = new Headers();
  headers.set('content-length', String(sizeBytes));
  headers.set('date', dateIso);
  return {
    headers,
    clone: jest.fn().mockReturnThis(),
    blob: jest.fn().mockResolvedValue({ size: sizeBytes }),
  } as unknown as Response;
}

/**
 * Cria um mock de Request com URL controlada.
 */
function createRequestMock(url: string): Request {
  return { url } as Request;
}

/**
 * Cria um mock de Cache com N entradas de ENTRY_SIZE_BYTES cada.
 * Timestamps são incrementados por segundo para garantir ordenação FIFO correta.
 */
function createCacheMockWithEntries(count: number): CacheApi {
  const baseDate = new Date('2024-01-01T00:00:00Z').getTime();
  const entries: Array<{ url: string; sizeBytes: number; dateIso: string }> = [];

  for (let i = 0; i < count; i++) {
    const ts = new Date(baseDate + i * 1000).toISOString();
    entries.push({
      url: `https://app.example.com/asset-${i}.js`,
      sizeBytes: ENTRY_SIZE_BYTES,
      dateIso: ts,
    });
  }

  const entryMap = new Map(
    entries.map((e) => [e.url, createResponseMock(e.sizeBytes, e.dateIso)]),
  );

  // Lista mutável de URLs para suportar deleção durante a varredura FIFO
  const urlList = entries.map((e) => e.url);

  return {
    keys: jest.fn().mockImplementation(() =>
      Promise.resolve(urlList.map(createRequestMock)),
    ),
    match: jest.fn().mockImplementation((req: Request | string) => {
      const url = typeof req === 'string' ? req : req.url;
      return Promise.resolve(entryMap.get(url));
    }),
    delete: jest.fn().mockImplementation((req: Request | string) => {
      const url = typeof req === 'string' ? req : req.url;
      const idx = urlList.indexOf(url);
      if (idx !== -1) urlList.splice(idx, 1);
      entryMap.delete(url);
      return Promise.resolve(true);
    }),
  };
}

/**
 * Cria um mock de CacheStorage com um único cache de N entradas.
 */
function createCacheStorageMock(entriesCount: number): CacheStorageApi {
  const cache = createCacheMockWithEntries(entriesCount);
  return {
    keys: jest.fn().mockResolvedValue(['runtime-cache']),
    open: jest.fn().mockResolvedValue(cache),
    delete: jest.fn().mockResolvedValue(true),
  };
}

/**
 * Executa uma única iteração do benchmark: chama `enforceCacheSizeLimit` e
 * retorna a duração em milissegundos.
 */
async function runBenchmarkIteration(entriesCount: number): Promise<number> {
  // Cria um storage fresco por iteração para simular condição real
  const cacheStorage = createCacheStorageMock(entriesCount);

  const startMs = performance.now();
  await enforceCacheSizeLimit(cacheStorage, CACHE_SIZE_LIMIT_BYTES);
  const endMs = performance.now();

  return endMs - startMs;
}

/**
 * Executa N iterações do benchmark para um volume de entradas e retorna
 * o array de durações em milissegundos.
 */
async function runBenchmark(entriesCount: number, iterations: number): Promise<number[]> {
  const durations: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const duration = await runBenchmarkIteration(entriesCount);
    durations.push(duration);
  }
  return durations;
}

// ---------------------------------------------------------------------------
// PT-3 — Benchmark de limpeza de cache (≤ 2000ms)
// ---------------------------------------------------------------------------

describe('enforceCacheSizeLimit — PT-3: Benchmark de limpeza de cache (≤ 2000ms)', () => {
  /**
   * PT-3 — Volume 1: 50 entradas (50 MB — exatamente no limite)
   *
   * Com 50 entradas de 1 MB cada, o total é exatamente 50 MB (no limite).
   * A operação percorre todas as entradas para calcular o tamanho mas
   * não executa limpeza (totalSizeBefore == limit). Este caso exercita
   * o caminho de coleta completa sem remoção.
   */
  it('conclui em ≤ 2000ms com 50 entradas (50 MB — no limite)', async () => {
    const durations = await runBenchmark(50, ITERATIONS);

    const maxDuration = Math.max(...durations);
    const avgDuration = durations.reduce((s, d) => s + d, 0) / durations.length;

    // Todas as iterações devem estar abaixo do threshold
    expect(maxDuration).toBeLessThanOrEqual(THRESHOLD_MS);

    // Log informativo para diagnóstico em CI (não falha o teste)
    console.info(
      `[PT-3] 50 entradas — max: ${maxDuration.toFixed(2)}ms | avg: ${avgDuration.toFixed(2)}ms`,
    );
  });

  /**
   * PT-3 — Volume 2: 100 entradas (100 MB — acima do limite em 2x)
   *
   * Com 100 entradas de 1 MB cada, o total é 100 MB — 2x o limite de 50 MB.
   * A operação deve remover as 50 entradas mais antigas (FIFO) até atingir
   * exatamente o limite. Este caso exercita o caminho completo de limpeza.
   */
  it('conclui em ≤ 2000ms com 100 entradas (100 MB — limpeza FIFO ativa)', async () => {
    const durations = await runBenchmark(100, ITERATIONS);

    const maxDuration = Math.max(...durations);
    const avgDuration = durations.reduce((s, d) => s + d, 0) / durations.length;

    expect(maxDuration).toBeLessThanOrEqual(THRESHOLD_MS);

    console.info(
      `[PT-3] 100 entradas — max: ${maxDuration.toFixed(2)}ms | avg: ${avgDuration.toFixed(2)}ms`,
    );
  });

  /**
   * PT-3 — Volume 3: 200 entradas (200 MB — acima do limite em 4x)
   *
   * Com 200 entradas de 1 MB cada, o total é 200 MB — 4x o limite de 50 MB.
   * A operação deve remover as 150 entradas mais antigas (FIFO) para que
   * as 50 mais recentes permaneçam. Este é o caso mais custoso e valida
   * que mesmo em volume máximo a operação termina dentro do threshold.
   */
  it('conclui em ≤ 2000ms com 200 entradas (200 MB — limpeza FIFO máxima)', async () => {
    const durations = await runBenchmark(200, ITERATIONS);

    const maxDuration = Math.max(...durations);
    const avgDuration = durations.reduce((s, d) => s + d, 0) / durations.length;

    expect(maxDuration).toBeLessThanOrEqual(THRESHOLD_MS);

    console.info(
      `[PT-3] 200 entradas — max: ${maxDuration.toFixed(2)}ms | avg: ${avgDuration.toFixed(2)}ms`,
    );
  });

  /**
   * PT-3 — Verificação de completude: 20 iterações executadas
   *
   * Garante que o benchmark realmente executa o número de iterações
   * especificado no `test-strategy.md`.
   */
  it('executa exatamente 20 iterações por volume', async () => {
    const durations50 = await runBenchmark(50, ITERATIONS);
    const durations100 = await runBenchmark(100, ITERATIONS);
    const durations200 = await runBenchmark(200, ITERATIONS);

    expect(durations50).toHaveLength(ITERATIONS);
    expect(durations100).toHaveLength(ITERATIONS);
    expect(durations200).toHaveLength(ITERATIONS);
  });
});
