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

describe('UpdateBannerUseCase.onUpdateAvailable()', () => {
  // UT-7 — callback chamado quando port dispara com flag false
  it('propaga o evento quando updateBannerDismissed é false', () => {
    let portCallback: (() => void) | undefined;
    const updatePort: IUpdatePort = {
      getUpdateReadiness: jest.fn().mockReturnValue({ status: 'idle', waitingSW: null }),
      onUpdateAvailable: jest.fn().mockImplementation((cb: () => void) => {
        portCallback = cb;
      }),
      activateUpdate: jest.fn().mockResolvedValue(undefined),
    };
    const sessionPort = makeSessionPort(false);
    const useCase = new UpdateBannerUseCase(updatePort, sessionPort);

    const userCallback = jest.fn();
    useCase.onUpdateAvailable(userCallback);

    portCallback!();

    expect(userCallback).toHaveBeenCalledTimes(1);
  });

  // UT-7 — flag true suprime o evento
  it('suprime o evento quando updateBannerDismissed é true', () => {
    let portCallback: (() => void) | undefined;
    const updatePort: IUpdatePort = {
      getUpdateReadiness: jest.fn().mockReturnValue({ status: 'idle', waitingSW: null }),
      onUpdateAvailable: jest.fn().mockImplementation((cb: () => void) => {
        portCallback = cb;
      }),
      activateUpdate: jest.fn().mockResolvedValue(undefined),
    };
    const sessionPort = makeSessionPort(true);
    const useCase = new UpdateBannerUseCase(updatePort, sessionPort);

    const userCallback = jest.fn();
    useCase.onUpdateAvailable(userCallback);

    portCallback!();

    expect(userCallback).not.toHaveBeenCalled();
  });

  // UT-7 — callback registrado é chamado quando port dispara (básico)
  it('chama o callback registrado quando IUpdatePort.onUpdateAvailable() dispara', () => {
    let portCallback: (() => void) | undefined;
    const updatePort: IUpdatePort = {
      getUpdateReadiness: jest.fn().mockReturnValue({ status: 'idle', waitingSW: null }),
      onUpdateAvailable: jest.fn().mockImplementation((cb: () => void) => {
        portCallback = cb;
      }),
      activateUpdate: jest.fn().mockResolvedValue(undefined),
    };
    const sessionPort = makeSessionPort(false);
    const useCase = new UpdateBannerUseCase(updatePort, sessionPort);

    const userCallback = jest.fn();
    useCase.onUpdateAvailable(userCallback);

    expect(portCallback).toBeDefined();
    portCallback!();
    expect(userCallback).toHaveBeenCalledTimes(1);
  });
});

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
