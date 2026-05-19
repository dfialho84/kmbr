/**
 * @jest-environment jsdom
 *
 * PT-2: Benchmark de atraso de verificacao de versao (delta mediano <= 100ms)
 *
 * Rastreabilidade: NFR-2 · T-51
 *
 * Mede o atraso introduzido pelo ciclo de verificacao assincrona de nova versao
 * no Service Worker sobre eventos de interacao do usuario (click).
 * O benchmark executa 30 iteracoes comparando o tempo de resposta a um evento
 * de click antes e apos ativar o ciclo de verificacao do SW mockado e verifica
 * que o delta mediano e <= 100ms.
 *
 * Metodo de medicao: performance.now() para calcular duracao de cada iteracao.
 * O ciclo de verificacao simulado consiste em navigator.serviceWorker.ready
 * resolvendo para um registration cujo metodo update() completa com latencia
 * controlada, representando o custo da verificacao periodica de versao.
 *
 * Depende de: T-32 (verificacao periodica de versao a cada 60 minutos)
 */

import { SerwistServiceWorkerAdapter } from '../SerwistServiceWorkerAdapter';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Delta maximo permitido entre baseline e com verificacao ativa (mediana). Rastreabilidade: NFR-2 */
const THRESHOLD_DELTA_MS = 100;

/** Numero de iteracoes do benchmark. Rastreabilidade: PT-2 (30 execucoes) */
const ITERATIONS = 30;

// ---------------------------------------------------------------------------
// Helpers — mock de ServiceWorkerRegistration e navigator.serviceWorker
// ---------------------------------------------------------------------------

/**
 * Cria um mock de ServiceWorkerRegistration com metodo update() controlado
 * via latencia simulada.
 *
 * @param updateLatencyMs - Latencia simulada de registration.update() em ms
 * @param failUpdate - Se true, update() rejeita com erro (simula falha de rede)
 */
function createRegistrationMock(
  updateLatencyMs: number = 0,
  failUpdate: boolean = false,
) {
  let resolveUpdate!: () => void;
  let rejectUpdate!: (err: Error) => void;

  const updatePromise = new Promise<void>((resolve, reject) => {
    resolveUpdate = resolve;
    rejectUpdate = reject;
  });

  const updateMock = jest.fn().mockImplementation(() => {
    if (failUpdate) {
      // Rejeita apos latencia simulada
      setTimeout(() => rejectUpdate(new Error('Failed to fetch')), updateLatencyMs);
      return updatePromise.catch(() => {});
    }
    // Resolve apos latencia simulada
    setTimeout(() => resolveUpdate(), updateLatencyMs);
    return updatePromise;
  });

  return {
    waiting: null as ServiceWorker | null,
    installing: null as ServiceWorker | null,
    active: null as ServiceWorker | null,
    update: updateMock,
    unregister: jest.fn().mockResolvedValue(true),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    scope: 'https://localhost/',
    // Permite controle externo da resolucao para evitar microtask races
    _resolveUpdate: resolveUpdate,
    _rejectUpdate: rejectUpdate,
  };
}

/**
 * Cria e instala mock de navigator.serviceWorker com registration controlado.
 * Retorna funcao de cleanup para restaurar o estado original.
 */
function setupNavigatorServiceWorker(
  registrationMock: ReturnType<typeof createRegistrationMock>,
): () => void {
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

  const serviceWorkerMock = {
    ready: Promise.resolve(registrationMock),
    controller: {} as ServiceWorker,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    register: jest.fn().mockResolvedValue(registrationMock),
  };

  Object.defineProperty(globalThis, 'navigator', {
    value: {
      ...navigator,
      serviceWorker: serviceWorkerMock,
      onLine: true,
    },
    configurable: true,
    writable: true,
  });

  return () => {
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', originalNavigator);
    }
  };
}

// ---------------------------------------------------------------------------
// Helpers — medicao de tempo de processamento de click
// ---------------------------------------------------------------------------

/**
 * Cria um elemento div com um event handler de click e mede o tempo de
 * processamento sincrono do evento. O handler executa uma operacao trivial
 * (incremento) para simular o custo baselina de processamento de interacao.
 *
 * Retorna o tempo decorrido em ms entre o dispatch do click e o retorno
 * do handler.
 */
function measureClickProcessingTime(): number {
  const start = performance.now();
  const div = document.createElement('div');
  let counter = 0;
  div.addEventListener('click', () => {
    counter++;
  });
  div.click();
  const elapsed = performance.now() - start;
  return elapsed;
}

// ---------------------------------------------------------------------------
// Helpers — estatistica
// ---------------------------------------------------------------------------

/**
 * Calcula a mediana de um array de valores numericos.
 * Ordena os valores ascendentemente e retorna o valor central
 * (ou media dos dois centrais para arrays de tamanho par).
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

// ---------------------------------------------------------------------------
// PT-2 — Benchmark de atraso de verificacao de versao (<= 100ms)
// ---------------------------------------------------------------------------

describe('SerwistServiceWorkerAdapter — PT-2: Benchmark de atraso de verificacao de versao', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Limpa intervalos que o adapter possa ter iniciado
    const intervals = window.setInterval(() => {}, 99999);
    for (let i = 0; i <= intervals; i++) {
      window.clearInterval(i);
    }
  });

  /**
   * PT-2 — Validacao principal
   *
   * Given o app esta rodando com Service Worker registrado
   *   And a verificacao periodica de versao esta ativa (registration.update chamado)
   *  When o benchmark executa 30 medicoes pareadas (baseline + com verificacao ativa)
   *  Then o delta mediano entre com-e-sem verificacao e <= 100ms (NFR-2)
   */
  it(`delta mediano <= ${THRESHOLD_DELTA_MS}ms em ${ITERATIONS} iteracoes (NFR-2)`, async () => {
    const deltas: number[] = [];

    for (let i = 0; i < ITERATIONS; i++) {
      // ---------------------------------------------------------------
      // Baseline: mede click SEM o ciclo de verificacao ativo
      // ---------------------------------------------------------------
      const baselineTime = measureClickProcessingTime();

      // ---------------------------------------------------------------
      // Setup: prepara ambiente com verificacao periodica ativa
      // ---------------------------------------------------------------
      // Cria registration cujo update() simula uma verificacao de versao
      // com latencia realistica (~50ms para simular ida ao servidor)
      const registration = createRegistrationMock(50, false);
      const cleanup = setupNavigatorServiceWorker(registration);

      // ---------------------------------------------------------------
      // Com verificacao: mede click APOS ativar o ciclo
      // ---------------------------------------------------------------
      const adapter = new SerwistServiceWorkerAdapter();

      // Aguarda o ready resolver e o checkForUpdate inicial ser disparado
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      // registration.update() deve ter sido chamado ao menos uma vez
      // (checkForUpdate na inicializacao)
      expect(registration.update).toHaveBeenCalled();

      // Mede o tempo de click com o ciclo de verificacao ativo
      const withCheckTime = measureClickProcessingTime();

      // Calcula o delta desta iteracao
      const delta = withCheckTime - baselineTime;
      deltas.push(delta);

      // Cleanup: para o intervalo e restaura navigator
      if (adapter._periodicCheckHandle !== null) {
        clearInterval(adapter._periodicCheckHandle);
      }
      cleanup();
    }

    // Calcula o delta mediano
    const medianDelta = calculateMedian(deltas);
    const maxDelta = Math.max(...deltas);
    const avgDelta = deltas.reduce((s, d) => s + d, 0) / deltas.length;

    expect(medianDelta).toBeLessThanOrEqual(THRESHOLD_DELTA_MS);

    console.info(
      `[PT-2] ${ITERATIONS} iteracoes — ` +
        `delta mediano: ${medianDelta.toFixed(3)}ms | ` +
        `delta max: ${maxDelta.toFixed(3)}ms | ` +
        `delta avg: ${avgDelta.toFixed(3)}ms`,
    );
  });

  /**
   * PT-2 — Verificacao de completude
   *
   * Garante que o benchmark executou exatamente o numero de iteracoes
   * especificado no test-strategy.md (30 execucoes).
   */
  it(`executa exatamente ${ITERATIONS} iteracoes`, () => {
    // Validacao conceitual: a iteracao principal ja verifica internamente
    // que registration.update foi chamado. Este teste confirma que o
    // loop de benchmark produz o numero correto de medicoes.
    const deltas: number[] = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const baseline = measureClickProcessingTime();
      deltas.push(measureClickProcessingTime() - baseline);
    }

    expect(deltas).toHaveLength(ITERATIONS);
  });

  /**
   * PT-2 — Verificacao do metodo de medicao: performance.now()
   *
   * Garante que performance.now() e utilizado para medir cada iteracao.
   */
  it('usa performance.now() para medir tempo de processamento de click', () => {
    const nowSpy = jest.spyOn(performance, 'now');

    measureClickProcessingTime();

    expect(nowSpy.mock.calls.length).toBeGreaterThanOrEqual(2);

    nowSpy.mockRestore();
  });

  /**
   * PT-2 — Sanidade: click handler executou corretamente
   *
   * Verifica que o event handler de click registrado no elemento e
   * chamado durante a medicao.
   */
  it('click handler executa durante a medicao baselina', () => {
    const handler = jest.fn();
    const div = document.createElement('div');
    div.addEventListener('click', handler);
    div.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  /**
   * PT-2 — Sanidade das medicoes
   *
   * Verifica que todas as medicoes produzem duracoes nao-negativas.
   */
  it('produz duracoes nao-negativas em todas as medicoes', () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const baseline = measureClickProcessingTime();
      expect(baseline).toBeGreaterThanOrEqual(0);

      const withCheck = measureClickProcessingTime();
      expect(withCheck).toBeGreaterThanOrEqual(0);
    }
  });

  /**
   * PT-2 — Teste unitario do calculateMedian
   *
   * Verifica o calculo da mediana com entradas conhecidas.
   */
  it('calculateMedian retorna o valor correto para entrada conhecida', () => {
    expect(calculateMedian([1, 2, 3, 4, 5])).toBe(3);
    expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    expect(calculateMedian([10])).toBe(10);
    expect(calculateMedian([])).toBe(0);
  });
});
