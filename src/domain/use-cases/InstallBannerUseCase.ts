import type { IInstallPort } from '../ports/IInstallPort';
import type { ISessionPort } from '../ports/ISessionPort';

const INSTALL_BANNER_DISMISSED_KEY = 'installBannerDismissed' as const;

/**
 * Caso de uso do banner de instalação PWA.
 *
 * Responsabilidade: decidir se o banner de instalação deve ser exibido,
 * delegar o prompt de instalação e registrar o descarte na sessão.
 *
 * Rastreabilidade: REQ-1 · REQ-2 · REQ-3 · REQ-5 · REQ-6 · REQ-22
 *
 * @remarks
 * Não possui dependência de Web APIs ou framework — depende apenas de
 * {@link IInstallPort} e {@link ISessionPort}, conforme DT-5.
 */
export class InstallBannerUseCase {
  constructor(
    private readonly installPort: IInstallPort,
    private readonly sessionPort: ISessionPort,
  ) {}

  /**
   * Determina se o banner de instalação deve ser exibido.
   *
   * Retorna `true` somente quando:
   * - O navegador suporta PWA e o prompt de instalação está disponível
   *   (`IInstallPort.isInstallAvailable() === true`), **e**
   * - O banner não foi descartado na sessão atual
   *   (`ISessionPort.getFlag('installBannerDismissed') === false`).
   *
   * Rastreabilidade: REQ-1 · REQ-6 · REQ-22
   */
  shouldShowBanner(): boolean {
    const installAvailable = this.installPort.isInstallAvailable();
    const dismissed = this.sessionPort.getFlag(INSTALL_BANNER_DISMISSED_KEY);

    return installAvailable && !dismissed;
  }

  /**
   * Dispara o prompt nativo de instalação do navegador.
   *
   * Delega para {@link IInstallPort.promptInstall} sem capturar erros —
   * rejeições são propagadas ao chamador.
   *
   * Rastreabilidade: REQ-3
   */
  async install(): Promise<void> {
    await this.installPort.promptInstall();
  }

  /**
   * Registra o descarte do banner na sessão atual.
   *
   * Persiste a flag `installBannerDismissed = true` via {@link ISessionPort},
   * impedindo que o banner seja reexibido na mesma sessão.
   *
   * Rastreabilidade: REQ-5 · REQ-6
   */
  dismiss(): void {
    this.sessionPort.setFlag(INSTALL_BANNER_DISMISSED_KEY, true);
  }
}
