import type { IInstallPort } from '@/domain/ports/IInstallPort';

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
 * - Implementar `IInstallPort` para o Domain
 *
 * Não contém lógica de negócio — delega decisões ao Domain via Ports.
 *
 * Rastreabilidade: REQ-1 · REQ-3 · REQ-22
 */
export class SerwistServiceWorkerAdapter implements IInstallPort {
  private installPromptEvent: BeforeInstallPromptEvent | null = null;

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    this.registerServiceWorker();
    this.listenForInstallPrompt();
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
}
