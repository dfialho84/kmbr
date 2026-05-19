import type { INetworkPort } from '@/domain/ports/INetworkPort';

/**
 * Adapter de infraestrutura que implementa {@link INetworkPort} usando
 * `navigator.onLine` e os eventos `online`/`offline` do navegador.
 *
 * Escopo de vida: deve ser instanciado uma vez e destruído via `destroy()`
 * quando o componente que o consume for desmontado, para evitar memory leaks.
 *
 * Rastreabilidade: REQ-17 · REQ-18 · REQ-19
 */
export class NetworkStatusAdapter implements INetworkPort {
  private readonly callbacks: Set<(online: boolean) => void> = new Set();

  private readonly handleOnline = (): void => {
    this.notifyAll(true);
  };

  private readonly handleOffline = (): void => {
    this.notifyAll(false);
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  /**
   * Retorna `true` se `navigator.onLine` for verdadeiro no momento da chamada.
   */
  isOnline(): boolean {
    if (typeof navigator === 'undefined') {
      return true;
    }
    return navigator.onLine;
  }

  /**
   * Registra um callback que será invocado sempre que o estado de
   * conectividade mudar. O mesmo callback pode ser registrado apenas uma vez.
   */
  onStatusChange(callback: (online: boolean) => void): void {
    this.callbacks.add(callback);
  }

  /**
   * Remove os event listeners do `window` e limpa todos os callbacks
   * registrados. Deve ser chamado quando o adapter não for mais necessário.
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.callbacks.clear();
  }

  private notifyAll(online: boolean): void {
    for (const cb of this.callbacks) {
      cb(online);
    }
  }
}
