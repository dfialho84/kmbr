import type { INetworkPort } from '../../ports/INetworkPort';
import { OfflineStatusUseCase } from '../OfflineStatusUseCase';

/**
 * UT-8: OfflineStatusUseCase — inicialização e reação a mudanças
 *
 * Rastreabilidade: REQ-17 · REQ-18 · REQ-19
 */

function makeNetworkPort(online: boolean): {
  port: INetworkPort;
  triggerStatusChange: (online: boolean) => void;
} {
  let capturedCallback: ((online: boolean) => void) | undefined;

  const port: INetworkPort = {
    isOnline: jest.fn().mockReturnValue(online),
    onStatusChange: jest.fn().mockImplementation((cb: (online: boolean) => void) => {
      capturedCallback = cb;
    }),
  };

  return {
    port,
    triggerStatusChange: (value: boolean) => {
      if (capturedCallback) capturedCallback(value);
    },
  };
}

describe('OfflineStatusUseCase', () => {
  describe('UT-8 — estado inicial', () => {
    it('reflete INetworkPort.isOnline() = true', () => {
      const { port } = makeNetworkPort(true);
      const useCase = new OfflineStatusUseCase(port);

      expect(useCase.isOnline()).toBe(true);
    });

    it('reflete INetworkPort.isOnline() = false', () => {
      const { port } = makeNetworkPort(false);
      const useCase = new OfflineStatusUseCase(port);

      expect(useCase.isOnline()).toBe(false);
    });
  });

  describe('UT-8 — reação a mudanças via callback', () => {
    it('callback online → false: propaga isOnline = false', () => {
      const { port, triggerStatusChange } = makeNetworkPort(true);
      const useCase = new OfflineStatusUseCase(port);

      const listener = jest.fn();
      useCase.onStatusChange(listener);

      triggerStatusChange(false);

      expect(useCase.isOnline()).toBe(false);
      expect(listener).toHaveBeenCalledWith(false);
    });

    it('callback online → true: propaga isOnline = true', () => {
      const { port, triggerStatusChange } = makeNetworkPort(false);
      const useCase = new OfflineStatusUseCase(port);

      const listener = jest.fn();
      useCase.onStatusChange(listener);

      triggerStatusChange(true);

      expect(useCase.isOnline()).toBe(true);
      expect(listener).toHaveBeenCalledWith(true);
    });
  });
});
