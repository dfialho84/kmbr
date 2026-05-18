/**
 * @jest-environment jsdom
 *
 * IT-3: SerwistServiceWorkerAdapter — isInstallAvailable() e promptInstall()
 *
 * Rastreabilidade: REQ-1 · REQ-3
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

describe('SerwistServiceWorkerAdapter — IT-3', () => {
  beforeEach(() => {
    // Mock de navigator.serviceWorker para evitar erros no ambiente JSDOM
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue({}),
        ready: Promise.resolve({}),
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
