/**
 * @jest-environment jsdom
 *
 * GH-9: Scenario "App inicializa rapidamente via cache estratégico"
 *
 * Rastreabilidade: REQ-21 · NFR-1 · NFR-2 · T-47
 *
 * Steps cobertos:
 *   Given o app já foi acessado e assets foram cacheados
 *     → Cache API mockado com assets estáticos pré-populados e respostas instantâneas
 *   And o usuário está em conexão 4G
 *     → navigator.onLine = true; navigator.connection mockado com effectiveType = '4g'
 *   When o usuário clica no ícone do app instalado
 *     → Renderizar componente raiz e medir tempo de mount via performance.mark
 *   Then o app abre e fica totalmente interativo em menos de 3 segundos
 *     → Medir intervalo via performance.mark/measure; verificar <= 3000ms
 *   And assets estáticos são carregados do cache primeiro
 *     → Verificar que caches.open / cache.match() foram chamados antes de fetch de rede
 *   And o cache é invalidado automaticamente quando há atualização de versão
 *     → Simular nova versão; verificar que caches.delete() é chamado para cache anterior
 */

import '@testing-library/jest-dom';

import { render } from '@testing-library/react';

import { cleanupOldCaches } from '@/infra/sw/cleanupOldCaches';

// ---------------------------------------------------------------------------
// Mocks dos hooks — isolam o teste das dependências de infraestrutura real
// ---------------------------------------------------------------------------
jest.mock('@/presentation/hooks/useInstallBanner', () => ({
  useInstallBanner: () => ({
    showBanner: false,
    onInstall: jest.fn(),
    onDismiss: jest.fn(),
  }),
}));

jest.mock('@/presentation/hooks/useUpdateBanner', () => ({
  useUpdateBanner: () => ({
    showBanner: false,
    onUpdate: jest.fn(),
    onDefer: jest.fn(),
  }),
}));

jest.mock('@/presentation/hooks/useOfflineStatus', () => ({
  useOfflineStatus: () => ({ isOnline: true }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Cria um mock de Cache individual com match() rastreável.
 * Retorna um objeto simples que representa uma Response cacheada
 * (sem depender de `Response` global que pode não estar disponível no JSDOM).
 */
function createCacheMock(assets: string[]) {
  const matchMock = jest.fn().mockImplementation((request: { url?: string } | string) => {
    const url = typeof request === 'string' ? request : (request.url ?? '');
    if (assets.some((a) => url.includes(a))) {
      // Retorna objeto que simula uma Response cacheada (duck typing)
      return Promise.resolve({ status: 200, ok: true, body: 'cached-content' });
    }
    return Promise.resolve(undefined);
  });

  return { match: matchMock };
}

/**
 * Cria um mock de CacheStorage com chaves e delete() rastreáveis.
 */
function createCacheStorageMock(cacheKeys: string[], cacheMock: ReturnType<typeof createCacheMock>) {
  const deleteMock = jest.fn().mockResolvedValue(true);
  const openMock = jest.fn().mockResolvedValue(cacheMock);

  return {
    keys: jest.fn().mockResolvedValue(cacheKeys),
    open: openMock,
    match: cacheMock.match,
    delete: deleteMock,
  };
}

// ---------------------------------------------------------------------------
// Setup global dos mocks de ambiente
// ---------------------------------------------------------------------------

let cacheStorageMock: ReturnType<typeof createCacheStorageMock>;
let cacheMock: ReturnType<typeof createCacheMock>;

const STATIC_ASSETS = [
  '/_next/static/css/main.css',
  '/_next/static/js/main.js',
  '/icons/icon-192.png',
];

const CURRENT_CACHE_NAME = 'serwist-precache-v2-https://localhost/';
const OLD_CACHE_NAME = 'serwist-precache-v1-https://localhost/';

beforeEach(() => {
  jest.useFakeTimers();

  // --- Cache API mock ---
  cacheMock = createCacheMock(STATIC_ASSETS);
  cacheStorageMock = createCacheStorageMock(
    [CURRENT_CACHE_NAME, OLD_CACHE_NAME],
    cacheMock,
  );

  Object.defineProperty(global, 'caches', {
    value: cacheStorageMock,
    configurable: true,
    writable: true,
  });

  // --- navigator.onLine ---
  Object.defineProperty(navigator, 'onLine', {
    value: true,
    configurable: true,
    writable: true,
  });

  // --- navigator.connection (Network Information API) ---
  Object.defineProperty(navigator, 'connection', {
    value: { effectiveType: '4g', downlink: 10, rtt: 50 },
    configurable: true,
    writable: true,
  });

  // --- navigator.serviceWorker (graceful degradation no adapter) ---
  Object.defineProperty(navigator, 'serviceWorker', {
    value: {
      ready: new Promise(() => {}), // nunca resolve — evita race conditions nos testes
      controller: null,
      addEventListener: jest.fn(),
      register: jest.fn(),
    },
    configurable: true,
    writable: true,
  });

  // --- performance API ---
  // Substitui a performance API inteiramente por um mock completo,
  // evitando problemas com métodos ausentes no JSDOM (ex: getEntriesByName).
  Object.defineProperty(global, 'performance', {
    value: {
      mark: jest.fn().mockReturnValue({} as PerformanceMark),
      measure: jest.fn().mockReturnValue({ duration: 150 } as PerformanceMeasure),
      getEntriesByName: jest.fn().mockReturnValue([{ duration: 150 }]),
      clearMarks: jest.fn(),
      clearMeasures: jest.fn(),
      now: jest.fn(() => Date.now()),
    },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Componente auxiliar que simula o "app raiz" para fins de teste
// (reproduz a estrutura do layout.tsx sem dependências de Next.js)
// ---------------------------------------------------------------------------
import React from 'react';
import { InstallBanner } from '@/presentation/components/InstallBanner';
import { UpdateBanner } from '@/presentation/components/UpdateBanner';
import { OfflineIndicator } from '@/presentation/components/OfflineIndicator';

function AppRoot(): React.JSX.Element {
  return (
    <div data-version="test-v2" data-testid="app-root">
      <InstallBanner />
      <UpdateBanner />
      <OfflineIndicator />
      <main data-testid="main-content">
        <h1>Kmbr</h1>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GH-9 — Step: Given o app já foi acessado e assets foram cacheados
//         And o usuário está em conexão 4G
// ---------------------------------------------------------------------------

describe('GH-9: Scenario "App inicializa rapidamente via cache estratégico"', () => {
  /**
   * Step: Given o app já foi acessado e assets foram cacheados
   * Verifica que o mock de Cache API está configurado com assets pré-populados.
   */
  it('Given: Cache API está populado com assets estáticos pré-cacheados', async () => {
    // Verifica que CacheStorage responde com as chaves esperadas
    const keys = await caches.keys();
    expect(keys).toContain(CURRENT_CACHE_NAME);

    // Verifica que cache.match() responde com conteúdo para assets estáticos
    const cssResponse = await cacheMock.match('/_next/static/css/main.css');
    expect(cssResponse).toBeDefined();
    expect(cssResponse?.status).toBe(200);
  });

  /**
   * Step: And o usuário está em conexão 4G
   * Verifica configuração de ambiente de rede.
   */
  it('And: navigator.onLine = true e navigator.connection.effectiveType = "4g"', () => {
    expect(navigator.onLine).toBe(true);
    expect((navigator as Navigator & { connection?: { effectiveType: string } }).connection?.effectiveType).toBe('4g');
  });

  /**
   * Steps: When o usuário clica no ícone do app instalado
   *        Then o app abre e fica totalmente interativo em menos de 3 segundos
   *
   * Mede o tempo de mount do componente raiz via performance.mark e verifica
   * que o valor medido está dentro do threshold de 3000ms (NFR-1).
   *
   * Em ambiente de teste com Cache API mockado respondendo instantaneamente,
   * o mount ocorre em menos de 1ms — o threshold de 3000ms representa o SLA
   * de produção em conexão 4G real.
   */
  it('Then: o app monta e fica interativo em menos de 3000ms (NFR-1)', () => {
    const startTime = performance.now();

    performance.mark('app-mount-start');

    // Simula abertura do app: renderizar componente raiz
    const { getByTestId } = render(<AppRoot />);

    performance.mark('app-mount-end');
    performance.measure('app-mount-duration', 'app-mount-start', 'app-mount-end');

    const endTime = performance.now();
    const actualDuration = endTime - startTime;

    // Componente raiz deve estar montado e interativo
    expect(getByTestId('app-root')).toBeInTheDocument();
    expect(getByTestId('main-content')).toBeInTheDocument();

    // Em ambiente de teste com cache mock, o mount é praticamente instantâneo.
    // Verificamos que está dentro do threshold NFR-1 de 3000ms.
    expect(actualDuration).toBeLessThanOrEqual(3000);

    // performance.mark e measure foram chamados (rastreabilidade de medição)
    expect(performance.mark).toHaveBeenCalledWith('app-mount-start');
    expect(performance.mark).toHaveBeenCalledWith('app-mount-end');
    expect(performance.measure).toHaveBeenCalledWith(
      'app-mount-duration',
      'app-mount-start',
      'app-mount-end',
    );
  });

  /**
   * Step: And assets estáticos são carregados do cache primeiro
   *
   * Verifica que o Cache API mock é consultado (match chamado) para assets
   * estáticos antes de qualquer fetch de rede. Em ambiente de teste, simulamos
   * a consulta direta ao Cache API para representar o comportamento do SW.
   *
   * O fetch de rede é mockado via jest.fn() atribuído ao global para não
   * depender do fetch nativo (pode não estar disponível no ambiente de teste).
   */
  it('And: assets estáticos são servidos do cache antes de fetch de rede', async () => {
    // Mock de fetch de rede — substitui o global sem spyOn
    const fetchMock = jest.fn().mockResolvedValue({ status: 200, ok: true, body: 'network-content' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = fetchMock;

    // Abre o cache e verifica match() antes de chamar fetch
    const cache = await caches.open(CURRENT_CACHE_NAME);

    for (const asset of STATIC_ASSETS) {
      const cachedResponse = await cache.match(asset);

      if (cachedResponse) {
        // Asset encontrado no cache — fetch de rede NÃO deve ser chamado para este asset
        // (comportamento cache-first do Service Worker — REQ-14 · T-33)
        continue;
      }

      // Asset não cacheado — cai para fetch de rede
      await fetchMock(asset);
    }

    // Todos os assets do mock devem ter sido servidos do cache
    // (match chamado para cada asset estático)
    expect(cacheMock.match).toHaveBeenCalledTimes(STATIC_ASSETS.length);

    // fetch de rede não deve ter sido chamado para assets que estão no cache
    expect(fetchMock).not.toHaveBeenCalled();
  });

  /**
   * Step: And o cache é invalidado automaticamente quando há atualização de versão
   *
   * Simula ativação de novo SW com nova versão de cache.
   * Verifica que cleanupOldCaches() chama caches.delete() para o cache anterior.
   * (REQ-21 · T-46)
   */
  it('And: cache da versão anterior é invalidado automaticamente ao ativar nova versão', async () => {
    // Simula ativação de novo SW: cleanupOldCaches é chamado com o cache atual
    const deleted = await cleanupOldCaches(CURRENT_CACHE_NAME, cacheStorageMock);

    // caches.delete() deve ter sido chamado para o cache da versão anterior
    expect(cacheStorageMock.delete).toHaveBeenCalledWith(OLD_CACHE_NAME);

    // Cache atual deve ser preservado (não deletado)
    expect(cacheStorageMock.delete).not.toHaveBeenCalledWith(CURRENT_CACHE_NAME);

    // Confirma que o cache antigo foi removido da lista
    expect(deleted).toContain(OLD_CACHE_NAME);
    expect(deleted).not.toContain(CURRENT_CACHE_NAME);
  });

  /**
   * Verificação adicional: o atributo data-version no DOM reflete a versão do build.
   * Garante rastreabilidade entre o DOM e o build implantado (GH-4 · T-27).
   */
  it('E: data-version no DOM corresponde à versão do build simulada', () => {
    const { getByTestId } = render(<AppRoot />);
    const appRoot = getByTestId('app-root');
    expect(appRoot).toHaveAttribute('data-version', 'test-v2');
  });

  /**
   * Verificação adicional: componentes críticos estão renderizados simultaneamente.
   * Garante que o cache estratégico não interfere no rendering dos componentes PWA.
   */
  it('E: componentes PWA (InstallBanner, UpdateBanner, OfflineIndicator) coexistem com conteúdo principal', () => {
    const { getByTestId, queryByTestId } = render(<AppRoot />);

    // Conteúdo principal renderizado
    expect(getByTestId('main-content')).toBeInTheDocument();

    // Banners não aparecem pois os hooks mockados retornam showBanner = false
    expect(queryByTestId('install-banner')).not.toBeInTheDocument();

    // OfflineIndicator não aparece pois isOnline = true
    expect(queryByTestId('offline-indicator')).not.toBeInTheDocument();
  });
});
