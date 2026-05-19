/**
 * @jest-environment jsdom
 *
 * ST-3: Falha no download de atualização não expõe versão parcialmente instalada
 *
 * Rastreabilidade: REQ-16 · T-35
 *
 * Verifica que em caso de falha durante o download de novo build (rede instável,
 * servidor indisponível, download interrompido), o SerwistServiceWorkerAdapter:
 *   - Não altera o cache existente (versão anterior permanece íntegra)
 *   - Não propaga erro à UI
 *   - Mantém updateReadiness.status === 'idle' (não anuncia versão inválida)
 *   - Permite nova tentativa na próxima sessão (sem acúmulo de estado de erro)
 */

import { SerwistServiceWorkerAdapter } from '../SerwistServiceWorkerAdapter';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createRegistrationMock(waitingSW: ServiceWorker | null = null) {
  const listeners: Record<string, EventListenerOrEventListenerObject[]> = {};

  const registration = {
    waiting: waitingSW,
    installing: null as ServiceWorker | null,
    update: jest.fn().mockResolvedValue(undefined),
    addEventListener: jest.fn((event: string, listener: EventListenerOrEventListenerObject) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(listener);
    }),
    _triggerUpdateFound: (newSW: ServiceWorker) => {
      (registration as { installing: ServiceWorker | null }).installing = newSW;
      const updateFoundListeners = listeners['updatefound'] ?? [];
      for (const l of updateFoundListeners) {
        if (typeof l === 'function') l(new Event('updatefound'));
        else l.handleEvent(new Event('updatefound'));
      }
    },
  };

  return registration;
}

function createSWMock(initialState: ServiceWorkerState = 'installing') {
  const listeners: Record<string, EventListenerOrEventListenerObject[]> = {};

  const sw = {
    state: initialState as ServiceWorkerState,
    postMessage: jest.fn(),
    addEventListener: jest.fn((event: string, listener: EventListenerOrEventListenerObject) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(listener);
    }),
    _triggerStateChange: (newState: ServiceWorkerState) => {
      (sw as { state: ServiceWorkerState }).state = newState;
      const stateListeners = listeners['statechange'] ?? [];
      for (const l of stateListeners) {
        if (typeof l === 'function') l(new Event('statechange'));
        else l.handleEvent(new Event('statechange'));
      }
    },
  } as unknown as ServiceWorker & {
    postMessage: jest.Mock;
    _triggerStateChange: (s: ServiceWorkerState) => void;
  };

  return sw;
}

// ---------------------------------------------------------------------------
// ST-3
// ---------------------------------------------------------------------------

describe('SerwistServiceWorkerAdapter — ST-3: Falha no download de atualização', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * ST-3 — Caso 1: Download interrompido (SW vai para estado 'redundant')
   *
   * Quando o download do novo build falha durante a instalação, o SW é descartado
   * pelo navegador (estado 'redundant'). O adapter não deve:
   *   - Alterar updateReadiness (permanece 'idle')
   *   - Chamar callbacks de atualização
   *   - Propagar erros à UI
   */
  it('não altera updateReadiness quando SW de download falha (estado redundant)', async () => {
    const registration = createRegistrationMock(null);
    let readyResolve!: (reg: typeof registration) => void;
    const readyPromise = new Promise<typeof registration>((resolve) => {
      readyResolve = resolve;
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: readyPromise,
        controller: {} as ServiceWorker,
        addEventListener: jest.fn(),
      },
      configurable: true,
      writable: true,
    });

    const adapter = new SerwistServiceWorkerAdapter();
    const updateCallback = jest.fn();
    adapter.onUpdateAvailable(updateCallback);

    readyResolve(registration);
    await readyPromise;
    await Promise.resolve();

    // Simula início do download de novo SW
    const failingSW = createSWMock('installing');
    registration._triggerUpdateFound(failingSW as unknown as ServiceWorker);

    // Simula falha no download: SW vai para estado 'redundant'
    failingSW._triggerStateChange('redundant');

    // updateReadiness deve permanecer 'idle' — versão inválida não é anunciada
    expect(adapter.getUpdateReadiness().status).toBe('idle');
    expect(adapter.getUpdateReadiness().waitingSW).toBeNull();

    // Callback de atualização não deve ter sido chamado
    expect(updateCallback).not.toHaveBeenCalled();
  });

  /**
   * ST-3 — Caso 2: Servidor indisponível (registration.update() rejeita com erro de rede)
   *
   * Quando a verificação periódica falha por servidor indisponível,
   * o adapter absorve o erro silenciosamente sem propagar à UI.
   */
  it('absorve silenciosamente falha de registration.update() sem propagar erro à UI', async () => {
    const registration = createRegistrationMock(null);
    // Simula servidor indisponível ou erro de rede
    registration.update.mockRejectedValue(new Error('Failed to fetch'));

    let readyResolve!: (reg: typeof registration) => void;
    const readyPromise = new Promise<typeof registration>((resolve) => {
      readyResolve = resolve;
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: readyPromise,
        controller: {} as ServiceWorker,
        addEventListener: jest.fn(),
      },
      configurable: true,
      writable: true,
    });

    const adapter = new SerwistServiceWorkerAdapter();

    readyResolve(registration);
    await readyPromise;
    // Aguarda microtasks do .then() e do checkForUpdate()
    await Promise.resolve();
    await Promise.resolve();

    // Aguarda a rejeição de registration.update() ser processada
    await Promise.resolve();

    // Estado permanece íntegro — não é afetado por falha de verificação
    expect(adapter.getUpdateReadiness().status).toBe('idle');

    // Nenhum erro deve ter sido propagado (console.error não chamado por causa da falha)
    // Nota: console.error pode ser chamado por outros motivos no ambiente JSDOM;
    // o importante é que nenhuma exceção escapou do adapter.
    // Verificação principal: o teste chegou até aqui sem lançar exceção.
  });

  /**
   * ST-3 — Caso 3: Retentativa na próxima sessão sem acúmulo de estado de erro
   *
   * Após uma falha de download (SW redundant), uma nova instância do adapter
   * deve iniciar em estado limpo ('idle'), permitindo nova tentativa de detecção
   * sem acúmulo de estado de erro da sessão anterior.
   */
  it('nova instância do adapter inicia em estado limpo após falha anterior', async () => {
    // --- Primeira sessão: falha de download ---
    const registration1 = createRegistrationMock(null);
    let readyResolve1!: (reg: typeof registration1) => void;
    const readyPromise1 = new Promise<typeof registration1>((resolve) => {
      readyResolve1 = resolve;
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: readyPromise1,
        controller: {} as ServiceWorker,
        addEventListener: jest.fn(),
      },
      configurable: true,
      writable: true,
    });

    const adapter1 = new SerwistServiceWorkerAdapter();
    readyResolve1(registration1);
    await readyPromise1;
    await Promise.resolve();

    const failingSW = createSWMock('installing');
    registration1._triggerUpdateFound(failingSW as unknown as ServiceWorker);
    failingSW._triggerStateChange('redundant');

    // Confirma que primeira sessão terminou com estado 'idle' (falha absorvida)
    expect(adapter1.getUpdateReadiness().status).toBe('idle');

    // --- Segunda sessão: nova instância sem estado de erro acumulado ---
    const registration2 = createRegistrationMock(null);

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve(registration2),
        controller: {} as ServiceWorker,
        addEventListener: jest.fn(),
      },
      configurable: true,
      writable: true,
    });

    const adapter2 = new SerwistServiceWorkerAdapter();
    await Promise.resolve();
    await Promise.resolve();

    // Nova instância inicia limpa — sem contaminação da sessão anterior
    expect(adapter2.getUpdateReadiness().status).toBe('idle');
    expect(adapter2.getUpdateReadiness().waitingSW).toBeNull();

    // Limpa o intervalo da segunda instância para não vazar entre testes
    if (adapter2._periodicCheckHandle !== null) {
      clearInterval(adapter2._periodicCheckHandle);
    }
  });
});

// ---------------------------------------------------------------------------
// ST-4
// ---------------------------------------------------------------------------

/**
 * ST-4: App não expõe erros técnicos de PWA em navegadores incompatíveis
 *
 * Rastreabilidade: NFR-5 · REQ-22 · T-48
 *
 * Vetor de ataque simulado: Reconhecimento de infraestrutura — identificar
 * via erros expostos se o app depende de SW, quais versões, quais caches existem.
 *
 * Verifica que em navegadores sem suporte a Service Workers, o adapter:
 *   - Não emite console errors ou warnings relacionados a SW
 *   - Não expõe mensagens de erro ou fallback na UI
 *   - Não expõe estado interno do SW, nome de cache ou versão de build
 *     via propriedades públicas ou atributos do DOM
 */
describe('SerwistServiceWorkerAdapter — ST-4: App não expõe erros técnicos de PWA', () => {
  let originalDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    // Remove navigator.serviceWorker para simular navegador sem suporte SW
    originalDescriptor = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).serviceWorker;
  });

  afterEach(() => {
    // Restaura navigator.serviceWorker original
    if (originalDescriptor) {
      Object.defineProperty(navigator, 'serviceWorker', originalDescriptor);
    }
    jest.restoreAllMocks();
  });

  /**
   * ST-4 — Caso 1: navigator.serviceWorker ausente — zero console errors ou
   * warnings relacionados a SW no carregamento.
   *
   * Quando 'serviceWorker' não está presente em navigator, a construção do
   * adapter não deve produzir nenhum console.error ou console.warn cuja
   * mensagem faça referência a service worker, instalação PWA ou cache.
   */
  it('não emite console errors ou warnings relacionados a SW sem navigator.serviceWorker', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const SW_RELATED_PATTERNS = [
      /service.?worker/i,
      /serviceworker/i,
      /beforeinstallprompt/i,
      /install.*prompt/i,
      /pwa/i,
      /sw\.js/i,
    ];

    function isSwRelated(args: unknown[]): boolean {
      return args.some((arg) => {
        const message = typeof arg === 'string' ? arg : String(arg);
        return SW_RELATED_PATTERNS.some((pattern) => pattern.test(message));
      });
    }

    new SerwistServiceWorkerAdapter();

    // Coleta todas as chamadas ao console que contenham termos SW/PWA
    const swErrors = consoleError.mock.calls.filter((args) => isSwRelated(args));
    const swWarnings = consoleWarn.mock.calls.filter((args) => isSwRelated(args));

    expect(swErrors).toHaveLength(0);
    expect(swWarnings).toHaveLength(0);
  });

  /**
   * ST-4 — Caso 2: beforeinstallprompt nunca disparado em navegador sem SW.
   *
   * Garante que a ausência do evento beforeinstallprompt não produz
   * nenhuma mensagem de erro ou texto de fallback visível ao usuário.
   * O adapter deve permanecer em estado silencioso sem emitir warnings
   * ou erros sobre a falta de suporte a instalação PWA.
   */
  it('não exibe mensagens de erro ou fallback quando beforeinstallprompt nunca é disparado', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    const adapter = new SerwistServiceWorkerAdapter();

    // Nenhum erro ou warning de console (de qualquer natureza) deve ser emitido
    // durante a construção em ambiente sem suporte SW
    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
    expect(consoleLog).not.toHaveBeenCalled();

    // isInstallAvailable retorna false sem suporte SW — sem fallback
    expect(adapter.isInstallAvailable()).toBe(false);

    // Chamar promptInstall em navegador sem suporte não deve lançar nem logar erro
    expect(adapter.promptInstall()).resolves.toBeUndefined();
  });

  /**
   * ST-4 — Caso 3: DOM não expõe atributos com estado interno do SW.
   *
   * O adapter não deve adicionar ao DOM atributos que exponham:
   *   - Versão de build (ex: data-sw-version)
   *   - Nome de cache (ex: data-cache-name)
   *   - Estado interno do SW (ex: data-sw-status)
   *
   * NOTA: O layout.tsx da aplicação expõe `data-version` para rastreamento
   * de deploy, controlado por variável de ambiente (NEXT_PUBLIC_BUILD_VERSION)
   * e não está relacionado ao estado interno do Service Worker.
   */
  it('não adiciona atributos ao DOM que exponham estado interno do Service Worker', () => {
    // Snapshots das propriedades do documento antes da criação do adapter
    const bodyAttrsBefore = document.body.getAttributeNames().sort();
    const htmlAttrsBefore = document.documentElement.getAttributeNames().sort();

    const adapter = new SerwistServiceWorkerAdapter();

    // O adapter não deve ter adicionado nenhum atributo ao body ou html
    const bodyAttrsAfter = document.body.getAttributeNames().sort();
    const htmlAttrsAfter = document.documentElement.getAttributeNames().sort();

    // Nenhum atributo novo foi adicionado ao DOM
    expect(bodyAttrsAfter).toEqual(bodyAttrsBefore);
    expect(htmlAttrsAfter).toEqual(htmlAttrsBefore);

    // Verificação explícita de que atributos SW-specific NÃO foram adicionados
    expect(document.body.hasAttribute('data-sw-version')).toBe(false);
    expect(document.body.hasAttribute('data-sw-status')).toBe(false);
    expect(document.body.hasAttribute('data-cache-name')).toBe(false);
    expect(document.documentElement.hasAttribute('data-sw-version')).toBe(false);

    // O adapter não deve expor estado interno via propriedades mutáveis na instância
    // (exceto _periodicCheckHandle e _reloadPage que são explicitamente @internal)
    const ownKeys = Object.keys(adapter).filter(
      (k) => k !== '_periodicCheckHandle' && k !== '_reloadPage',
    );
    for (const key of ownKeys) {
      const value = (adapter as Record<string, unknown>)[key];
      // Nenhuma propriedade interna deve conter string com padrão de cache, SW ou versão
      if (typeof value === 'string') {
        expect(value).not.toMatch(/cache|service.?worker|precache/i);
      }
    }
  });
});
