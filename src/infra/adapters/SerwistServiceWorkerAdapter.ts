import type { IInstallPort } from '@/domain/ports/IInstallPort';
import type { IUpdatePort, UpdateReadiness } from '@/domain/ports/IUpdatePort';

/**
 * Referência ao evento BeforeInstallPromptEvent capturado em memória.
 * Mantido fora da classe para sobreviver a hot-reloads em dev.
 *
 * Rastreabilidade: REQ-1 · REQ-3
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Adapter de infraestrutura responsável por:
 * - Registrar o Service Worker via Serwist
 * - Interceptar o evento `beforeinstallprompt` e armazenar referência em memória
 * - Detectar SW em estado `waiting` e notificar callbacks registrados
 * - Implementar `IInstallPort` e `IUpdatePort` para o Domain
 *
 * Não contém lógica de negócio — delega decisões ao Domain via Ports.
 *
 * Rastreabilidade: REQ-1 · REQ-3 · REQ-7 · REQ-13 · REQ-15 · REQ-16 · REQ-22
 */
export class SerwistServiceWorkerAdapter implements IInstallPort, IUpdatePort {
  private installPromptEvent: BeforeInstallPromptEvent | null = null;

  private updateReadiness: UpdateReadiness = {
    status: 'idle',
    waitingSW: null,
  };

  private updateCallbacks: Array<() => void> = [];

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    this.registerServiceWorker();
    this.listenForInstallPrompt();
    this.listenForSWWaiting();
  }

  // ---------------------------------------------------------------------------
  // IInstallPort
  // ---------------------------------------------------------------------------

  /**
   * Retorna `true` somente após o evento `beforeinstallprompt` ter sido
   * capturado e antes de o prompt ter sido consumido.
   *
   * Rastreabilidade: REQ-1 · REQ-22
   */
  isInstallAvailable(): boolean {
    return this.installPromptEvent !== null;
  }

  /**
   * Invoca `event.prompt()` na instância capturada e marca o prompt
   * como consumido, tornando `isInstallAvailable()` `false` após a chamada.
   *
   * Rastreabilidade: REQ-3
   */
  async promptInstall(): Promise<void> {
    if (!this.installPromptEvent) {
      return;
    }

    const event = this.installPromptEvent;
    // Consumir o prompt — navegadores permitem apenas uma chamada
    this.installPromptEvent = null;

    await event.prompt();
  }

  // ---------------------------------------------------------------------------
  // IUpdatePort
  // ---------------------------------------------------------------------------

  /**
   * Retorna o estado atual de prontidão de atualização do SW.
   *
   * Rastreabilidade: REQ-7 · REQ-13
   */
  getUpdateReadiness(): UpdateReadiness {
    return this.updateReadiness;
  }

  /**
   * Registra um callback a ser acionado quando um SW em estado `waiting`
   * for detectado. Múltiplos callbacks são suportados.
   *
   * Rastreabilidade: REQ-7 · REQ-16
   */
  onUpdateAvailable(callback: () => void): void {
    this.updateCallbacks.push(callback);
  }

  /**
   * Envia `postMessage({ type: 'SKIP_WAITING' })` ao SW em waiting e
   * escuta `controllerchange` para recarregar a página.
   *
   * Rastreabilidade: REQ-9 · REQ-15
   */
  async activateUpdate(): Promise<void> {
    const waitingSW = this.updateReadiness.waitingSW;
    if (!waitingSW) {
      return;
    }

    this.updateReadiness = { ...this.updateReadiness, status: 'activating' };
    waitingSW.postMessage({ type: 'SKIP_WAITING' });

    await new Promise<void>((resolve) => {
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => {
          window.location.reload();
          resolve();
        },
        { once: true },
      );
    });
  }

  // ---------------------------------------------------------------------------
  // Inicialização privada
  // ---------------------------------------------------------------------------

  private registerServiceWorker(): void {
    if (!('serviceWorker' in navigator)) {
      // Graceful degradation — REQ-22
      return;
    }

    // O registro efetivo ocorre via @serwist/next no arquivo de SW gerado
    // pelo build do Next.js. Aqui apenas garantimos que o módulo é importado
    // no lado cliente quando o ambiente suporta.
    import('@serwist/next/worker').catch(() => {
      // Falha silenciosa — ausência do arquivo de SW em dev não deve
      // interromper o app. O arquivo só existe após `next build`.
    });
  }

  private listenForInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      // Previne o mini-infobar automático do Chrome em mobile
      event.preventDefault();
      this.installPromptEvent = event as BeforeInstallPromptEvent;
    });
  }

  /**
   * Escuta eventos de atualização do Service Worker.
   * Quando um SW entra em estado `waiting`, atualiza `UpdateReadiness`
   * e notifica todos os callbacks registrados.
   *
   * Rastreabilidade: REQ-7 · REQ-13 · REQ-16
   */
  private listenForSWWaiting(): void {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.ready
      .then((registration) => {
        if (registration.waiting) {
          this.handleWaitingSW(registration.waiting);
        }

        registration.addEventListener('updatefound', () => {
          const newSW = registration.installing;
          if (!newSW) return;

          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              this.handleWaitingSW(newSW);
            }
          });
        });
      })
      .catch(() => {
        // Falha silenciosa — SW pode não estar disponível em dev.
        // O app continua funcional sem detecção de atualizações.
      });
  }

  private handleWaitingSW(sw: ServiceWorker): void {
    this.updateReadiness = { status: 'available', waitingSW: sw };
    for (const cb of this.updateCallbacks) {
      cb();
    }
  }
}
