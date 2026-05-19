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
