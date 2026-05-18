/**
 * Testes unitários do InstallBannerUseCase.
 *
 * UT-1: shouldShowBanner() — Rastreabilidade: REQ-1 · REQ-5 · REQ-6 · REQ-22
 * UT-2: install()          — Rastreabilidade: REQ-3
 * UT-3: dismiss()          — Rastreabilidade: REQ-5 · REQ-6
 */

import { InstallBannerUseCase } from '../InstallBannerUseCase';
import type { IInstallPort } from '../../ports/IInstallPort';
import type { ISessionPort } from '../../ports/ISessionPort';

function makeInstallPort(
  isAvailable: boolean,
  promptImpl?: () => Promise<void>,
): IInstallPort {
  return {
    isInstallAvailable: () => isAvailable,
    promptInstall: promptImpl ?? jest.fn().mockResolvedValue(undefined),
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

/**
 * UT-2: InstallBannerUseCase.install()
 *
 * Rastreabilidade: REQ-3
 */
describe('InstallBannerUseCase.install()', () => {
  /**
   * UT-2 — Caso 1: caminho feliz
   * promptInstall() resolve → install() resolve sem erros
   */
  it('chama IInstallPort.promptInstall() e aguarda resolução', async () => {
    const promptInstall = jest.fn().mockResolvedValue(undefined);
    const useCase = new InstallBannerUseCase(
      makeInstallPort(true, promptInstall),
      makeSessionPort(false),
    );

    await expect(useCase.install()).resolves.toBeUndefined();
    expect(promptInstall).toHaveBeenCalledTimes(1);
  });

  /**
   * UT-2 — Caso 2: rejeição propagada
   * promptInstall() rejeita → erro propagado sem captura silenciosa
   */
  it('propaga rejeição de promptInstall() sem captura silenciosa', async () => {
    const error = new Error('install cancelado pelo usuário');
    const promptInstall = jest.fn().mockRejectedValue(error);
    const useCase = new InstallBannerUseCase(
      makeInstallPort(true, promptInstall),
      makeSessionPort(false),
    );

    await expect(useCase.install()).rejects.toThrow('install cancelado pelo usuário');
  });
});

/**
 * UT-3: InstallBannerUseCase.dismiss()
 *
 * Rastreabilidade: REQ-5 · REQ-6
 */
describe('InstallBannerUseCase.dismiss()', () => {
  /**
   * UT-3 — Caso 1: setFlag chamado com chave e valor corretos
   * dismiss() deve chamar setFlag('installBannerDismissed', true)
   */
  it('chama ISessionPort.setFlag com installBannerDismissed e valor booleano true', () => {
    const setFlag = jest.fn();
    const sessionPort: ISessionPort = {
      getFlag: () => false,
      setFlag,
    };
    const useCase = new InstallBannerUseCase(
      makeInstallPort(true),
      sessionPort,
    );

    useCase.dismiss();

    expect(setFlag).toHaveBeenCalledTimes(1);
    expect(setFlag).toHaveBeenCalledWith('installBannerDismissed', true);
  });

  /**
   * UT-3 — Caso 2: valor booleano, não string
   * O valor passado para setFlag deve ser o booleano true, não a string 'true'
   */
  it('passa o valor booleano true (não a string "true") para setFlag', () => {
    const setFlag = jest.fn();
    const sessionPort: ISessionPort = {
      getFlag: () => false,
      setFlag,
    };
    const useCase = new InstallBannerUseCase(
      makeInstallPort(true),
      sessionPort,
    );

    useCase.dismiss();

    const [, value] = setFlag.mock.calls[0];
    expect(value).toBe(true);
    expect(typeof value).toBe('boolean');
  });
});
