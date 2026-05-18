import type { IUpdatePort } from '../ports/IUpdatePort';
import type { ISessionPort } from '../ports/ISessionPort';

const UPDATE_BANNER_DISMISSED_KEY = 'updateBannerDismissed' as const;

/**
 * Caso de uso do banner de atualização PWA.
 *
 * Responsabilidade: decidir se o banner de atualização deve ser exibido,
 * delegar a ativação da nova versão e registrar o adiamento na sessão.
 *
 * Rastreabilidade: REQ-7 · REQ-8 · REQ-9 · REQ-11 · REQ-12
 *
 * @remarks
 * Não possui dependência de Web APIs ou framework — depende apenas de
 * {@link IUpdatePort} e {@link ISessionPort}, conforme DT-5.
 */
export class UpdateBannerUseCase {
  constructor(
    private readonly updatePort: IUpdatePort,
    private readonly sessionPort: ISessionPort,
  ) {}

  /**
   * Determina se o banner de atualização deve ser exibido.
   *
   * Retorna `true` somente quando:
   * - Há uma nova versão disponível em cache
   *   (`IUpdatePort.getUpdateReadiness().status === 'available'`), **e**
   * - O banner não foi adiado na sessão atual
   *   (`ISessionPort.getFlag('updateBannerDismissed') === false`).
   *
   * Rastreabilidade: REQ-7 · REQ-8 · REQ-11 · REQ-12
   */
  shouldShowBanner(): boolean {
    const { status } = this.updatePort.getUpdateReadiness();
    const dismissed = this.sessionPort.getFlag(UPDATE_BANNER_DISMISSED_KEY);

    return status === 'available' && !dismissed;
  }
}
