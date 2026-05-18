import { UpdateBannerUseCase } from '../UpdateBannerUseCase';
import type { IUpdatePort, UpdateReadiness } from '../../ports/IUpdatePort';
import type { ISessionPort } from '../../ports/ISessionPort';

function makeUpdatePort(status: UpdateReadiness['status']): IUpdatePort {
  return {
    getUpdateReadiness: () => ({ status, waitingSW: null }),
    onUpdateAvailable: jest.fn(),
    activateUpdate: jest.fn().mockResolvedValue(undefined),
  };
}

function makeSessionPort(dismissed: boolean): ISessionPort {
  return {
    getFlag: jest.fn().mockReturnValue(dismissed),
    setFlag: jest.fn(),
  };
}

describe('UpdateBannerUseCase.shouldShowBanner()', () => {
  // UT-4 — caminho feliz
  it('retorna true quando status é available e banner não foi adiado', () => {
    const useCase = new UpdateBannerUseCase(
      makeUpdatePort('available'),
      makeSessionPort(false),
    );
    expect(useCase.shouldShowBanner()).toBe(true);
  });

  // UT-4 — SW não em waiting
  it('retorna false quando status é idle', () => {
    const useCase = new UpdateBannerUseCase(
      makeUpdatePort('idle'),
      makeSessionPort(false),
    );
    expect(useCase.shouldShowBanner()).toBe(false);
  });

  // UT-4 — banner adiado na sessão
  it('retorna false quando updateBannerDismissed é true', () => {
    const useCase = new UpdateBannerUseCase(
      makeUpdatePort('available'),
      makeSessionPort(true),
    );
    expect(useCase.shouldShowBanner()).toBe(false);
  });
});
