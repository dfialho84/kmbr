import type { INetworkPort } from '../ports/INetworkPort';

/**
 * Caso de uso de estado de conectividade da rede.
 *
 * Responsabilidade: expor o estado atual de conexão e propagar mudanças
 * de conectividade para os consumidores registrados.
 *
 * Rastreabilidade: REQ-17 · REQ-18 · REQ-19
 *
 * @remarks
 * Não possui dependência de Web APIs ou framework — depende apenas de
 * {@link INetworkPort}, garantindo isolamento total do Domain.
 */
export class OfflineStatusUseCase {
  private _isOnline: boolean;
  private readonly listeners: Array<(online: boolean) => void> = [];

  constructor(private readonly networkPort: INetworkPort) {
    this._isOnline = this.networkPort.isOnline();

    this.networkPort.onStatusChange((online: boolean) => {
      this._isOnline = online;
      for (const listener of this.listeners) {
        listener(online);
      }
    });
  }

  /**
   * Retorna o estado atual de conectividade.
   *
   * Rastreabilidade: REQ-17 · REQ-18
   */
  isOnline(): boolean {
    return this._isOnline;
  }

  /**
   * Registra um callback que será notificado a cada mudança de conectividade.
   *
   * Rastreabilidade: REQ-18 · REQ-19
   */
  onStatusChange(callback: (online: boolean) => void): void {
    this.listeners.push(callback);
  }
}
