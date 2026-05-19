/**
 * @jest-environment jsdom
 *
 * IT-3: SerwistServiceWorkerAdapter — isInstallAvailable() e promptInstall()
 * IT-4: SerwistServiceWorkerAdapter — getUpdateReadiness() e onUpdateAvailable()
 *
 * Rastreabilidade: REQ-1 · REQ-3 · REQ-7 · REQ-9 · REQ-13 · REQ-15 · REQ-16
 *
 * Dependências reais usadas: window com evento beforeinstallprompt simulado
 * via window.dispatchEvent(); navigator.serviceWorker mockado.
 */

import { SerwistServiceWorkerAdapter } from '../SerwistServiceWorkerAdapter';

/**
 * Cria um mock do BeforeInstallPromptEvent compatível com a interface
 * interna do adapter.
 */
function createBeforeInstallPromptEvent(outcome: 'accepted' | 'dismissed' = 'accepted'): Event & {
  prompt: jest.Mock;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
} {
  const promptMock = jest.fn().mockResolvedValue({ outcome });
  const event = new Event('beforeinstallprompt', { bubbles: true, cancelable: true }) as Event & {
    prompt: jest.Mock;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };
  event.prompt = promptMock;
  event.userChoice = Promise.resolve({ outcome });
  return event;
}

/**
 * Cria um mock mínimo de ServiceWorkerRegistration para IT-3.
 * Sem SW em waiting por padrão.
 */
function createRegistrationMock(waitingSW: ServiceWorker | null = null) {
  const listeners: Record<string, EventListenerOrEventListenerObject[]> = {};

  const registration = {
    waiting: waitingSW,
    installing: null as ServiceWorker | null,
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

/**
 * Cria um mock de ServiceWorker com statechange controlável.
 */
function createSWMock() {
  const listeners: Record<string, EventListenerOrEventListenerObject[]> = {};

  const sw = {
    state: 'installing' as ServiceWorkerState,
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

describe('SerwistServiceWorkerAdapter — IT-3', () => {
  beforeEach(() => {
    // Mock de navigator.serviceWorker para evitar erros no ambiente JSDOM
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue({}),
        ready: Promise.resolve(createRegistrationMock()),
        controller: null,
        addEventListener: jest.fn(),
      },
      configurable: true,
      writable: true,
    });

    // Suprimir erros de importação dinâmica do @serwist/next/worker em testes
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * IT-3 — Caso 1: Antes do evento beforeinstallprompt
   * isInstallAvailable() deve retornar false antes do evento ser disparado
   */
  it('retorna false antes do evento beforeinstallprompt ser disparado', () => {
    const adapter = new SerwistServiceWorkerAdapter();

    expect(adapter.isInstallAvailable()).toBe(false);
  });

  /**
   * IT-3 — Caso 2: Após beforeinstallprompt disparado
   * isInstallAvailable() deve retornar true após o evento ser capturado
   */
  it('retorna true após beforeinstallprompt ser disparado', () => {
    const adapter = new SerwistServiceWorkerAdapter();
    const event = createBeforeInstallPromptEvent();

    window.dispatchEvent(event);

    expect(adapter.isInstallAvailable()).toBe(true);
  });

  /**
   * IT-3 — Caso 3: promptInstall() chama event.prompt()
   * Deve invocar prompt() na instância do evento capturado
   */
  it('promptInstall() chama event.prompt() na instância capturada', async () => {
    const adapter = new SerwistServiceWorkerAdapter();
    const event = createBeforeInstallPromptEvent('accepted');

    window.dispatchEvent(event);
    await adapter.promptInstall();

    expect(event.prompt).toHaveBeenCalledTimes(1);
  });

  /**
   * IT-3 — Caso 4: Após promptInstall() executado
   * isInstallAvailable() deve retornar false (prompt consumido)
   */
  it('retorna false após promptInstall() ser executado (prompt consumido)', async () => {
    const adapter = new SerwistServiceWorkerAdapter();
    const event = createBeforeInstallPromptEvent();

    window.dispatchEvent(event);
    expect(adapter.isInstallAvailable()).toBe(true);

    await adapter.promptInstall();

    expect(adapter.isInstallAvailable()).toBe(false);
  });
});

/**
 * T-48: Detecção de suporte PWA e graceful degradation
 *
 * Rastreabilidade: REQ-22 · NFR-5
 *
 * Garante que quando `'serviceWorker' in navigator` é false o adapter:
 *   - Não registra SW
 *   - Não intercepta beforeinstallprompt
 *   - Mantém isInstallAvailable() = false
 *   - Não lança erros nem emite console warnings/errors relacionados a PWA
 */
describe('SerwistServiceWorkerAdapter — T-48: Graceful degradation sem suporte PWA', () => {
  let originalDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    // Remove navigator.serviceWorker para simular navegador sem suporte
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
   * T-48 — Caso 1: isInstallAvailable() retorna false sem suporte a ServiceWorker
   */
  it('isInstallAvailable() retorna false em navegador sem suporte a ServiceWorker', () => {
    expect('serviceWorker' in navigator).toBe(false);

    const adapter = new SerwistServiceWorkerAdapter();

    expect(adapter.isInstallAvailable()).toBe(false);
  });

  /**
   * T-48 — Caso 2: Nenhum erro é lançado durante a construção
   */
  it('não lança erros durante a construção em ambiente sem ServiceWorker', () => {
    expect(() => new SerwistServiceWorkerAdapter()).not.toThrow();
  });

  /**
   * T-48 — Caso 3: Nenhum console.error ou console.warn é emitido
   */
  it('não emite console.error nem console.warn durante a construção sem ServiceWorker', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    new SerwistServiceWorkerAdapter();

    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  /**
   * T-48 — Caso 4: evento beforeinstallprompt disparado não altera isInstallAvailable()
   * Garante que o listener não foi registrado (não há side-effect mesmo se o evento
   * fosse disparado por algum motivo externo)
   */
  it('isInstallAvailable() permanece false mesmo após beforeinstallprompt ser disparado', () => {
    const adapter = new SerwistServiceWorkerAdapter();

    // Simula disparo do evento mesmo sem suporte oficial
    const event = new Event('beforeinstallprompt', { bubbles: true, cancelable: true });
    window.dispatchEvent(event);

    expect(adapter.isInstallAvailable()).toBe(false);
  });

  /**
   * T-48 — Caso 5: getUpdateReadiness() retorna status 'idle' sem suporte a ServiceWorker
   */
  it('getUpdateReadiness() retorna status idle em ambiente sem ServiceWorker', () => {
    const adapter = new SerwistServiceWorkerAdapter();

    expect(adapter.getUpdateReadiness().status).toBe('idle');
    expect(adapter.getUpdateReadiness().waitingSW).toBeNull();
  });
});

describe('SerwistServiceWorkerAdapter — IT-4', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * IT-4 — Caso 1: Sem SW em waiting
   * getUpdateReadiness().status deve ser 'idle' quando não há SW em waiting
   */
  it('retorna status idle quando não há SW em waiting', () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve(createRegistrationMock(null)),
        controller: null,
        addEventListener: jest.fn(),
      },
      configurable: true,
      writable: true,
    });

    const adapter = new SerwistServiceWorkerAdapter();

    expect(adapter.getUpdateReadiness().status).toBe('idle');
    expect(adapter.getUpdateReadiness().waitingSW).toBeNull();
  });

  /**
   * IT-4 — Caso 2: SW entra em estado waiting
   * callback registrado via onUpdateAvailable() é chamado e status passa para 'available'
   */
  it('chama callback e atualiza status para available quando SW entra em waiting', async () => {
    const registration = createRegistrationMock(null);
    let readyResolve!: (reg: typeof registration) => void;
    const readyPromise = new Promise<typeof registration>((resolve) => {
      readyResolve = resolve;
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: readyPromise,
        controller: {} as ServiceWorker, // simula SW ativo (necessário para statechange acionar)
        addEventListener: jest.fn(),
      },
      configurable: true,
      writable: true,
    });

    const adapter = new SerwistServiceWorkerAdapter();

    const callback = jest.fn();
    adapter.onUpdateAvailable(callback);

    // Resolve a promise ready com o registration mock
    readyResolve(registration);
    await readyPromise;

    // Aguarda microtasks do .then() dentro do adapter
    await Promise.resolve();

    // Cria novo SW e simula ciclo de vida: installing → installed
    const newSW = createSWMock();
    registration._triggerUpdateFound(newSW as unknown as ServiceWorker);
    newSW._triggerStateChange('installed');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(adapter.getUpdateReadiness().status).toBe('available');
    expect(adapter.getUpdateReadiness().waitingSW).toBe(newSW);
  });

  /**
   * IT-4 — Caso 3: activateUpdate() envia postMessage SKIP_WAITING ao SW em waiting
   */
  it('activateUpdate() envia postMessage SKIP_WAITING ao SW em waiting', async () => {
    const waitingSW = createSWMock();
    const registration = createRegistrationMock(waitingSW as unknown as ServiceWorker);

    const controllerChangeListeners: EventListenerOrEventListenerObject[] = [];

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve(registration),
        controller: {} as ServiceWorker,
        addEventListener: jest.fn(
          (event: string, listener: EventListenerOrEventListenerObject) => {
            if (event === 'controllerchange') controllerChangeListeners.push(listener);
          },
        ),
      },
      configurable: true,
      writable: true,
    });

    const adapter = new SerwistServiceWorkerAdapter();

    // Aguarda microtasks da inicialização (ready.then)
    await Promise.resolve();
    await Promise.resolve();

    // Inicia activateUpdate e dispara controllerchange para resolver a promise interna
    const activatePromise = adapter.activateUpdate();

    // Dispara o evento controllerchange para desbloquear o await interno
    for (const l of controllerChangeListeners) {
      if (typeof l === 'function') l(new Event('controllerchange'));
      else l.handleEvent(new Event('controllerchange'));
    }

    await activatePromise;

    expect(waitingSW.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });
});
