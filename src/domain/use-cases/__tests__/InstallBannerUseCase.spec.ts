/**
 * UT-1: InstallBannerUseCase.shouldShowBanner()
 *
 * Rastreabilidade: REQ-1 · REQ-5 · REQ-6 · REQ-22
 */

import { InstallBannerUseCase } from '../InstallBannerUseCase';
import type { IInstallPort } from '../../ports/IInstallPort';
import type { ISessionPort } from '../../ports/ISessionPort';

function makeInstallPort(isAvailable: boolean): IInstallPort {
  return {
    isInstallAvailable: () => isAvailable,
    promptInstall: jest.fn().mockResolvedValue(undefined),
  };
}

function makeSessionPort(dismissed: boolean): ISessionPort {
  return {
    getFlag: () => dismissed,
    setFlag: jest.fn(),
  };
}

describe('InstallBannerUseCase.shouldShowBanner()', () => {
  /**
   * UT-1 — Caso 1: caminho feliz
   * isInstallAvailable = true, installBannerDismissed = false → retorna true
   */
  it('retorna true quando install disponível e banner não descartado', () => {
    const useCase = new InstallBannerUseCase(
      makeInstallPort(true),
      makeSessionPort(false),
    );

    expect(useCase.shouldShowBanner()).toBe(true);
  });

  /**
   * UT-1 — Caso 2: install indisponível
   * isInstallAvailable = false → retorna false (independente da flag)
   */
  it('retorna false quando install indisponível', () => {
    const useCase = new InstallBannerUseCase(
      makeInstallPort(false),
      makeSessionPort(false),
    );

    expect(useCase.shouldShowBanner()).toBe(false);
  });

  /**
   * UT-1 — Caso 3: banner descartado na sessão
   * installBannerDismissed = true → retorna false (independente de install disponível)
   */
  it('retorna false quando banner foi descartado na sessão', () => {
    const useCase = new InstallBannerUseCase(
      makeInstallPort(true),
      makeSessionPort(true),
    );

    expect(useCase.shouldShowBanner()).toBe(false);
  });

  /**
   * UT-1 — Caso 4: ambas condições falsas
   * isInstallAvailable = false e installBannerDismissed = true → retorna false
   */
  it('retorna false quando ambas condições são falsas', () => {
    const useCase = new InstallBannerUseCase(
      makeInstallPort(false),
      makeSessionPort(true),
    );

    expect(useCase.shouldShowBanner()).toBe(false);
  });
});
