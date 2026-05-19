/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';

import { OfflineIndicator } from '@/presentation/components/OfflineIndicator';

// Mock do hook — isola o componente das dependências de infraestrutura
jest.mock('@/presentation/hooks/useOfflineStatus');

import { useOfflineStatus } from '@/presentation/hooks/useOfflineStatus';

const mockUseOfflineStatus = useOfflineStatus as jest.MockedFunction<typeof useOfflineStatus>;

/**
 * Testes do componente OfflineIndicator.
 *
 * Rastreabilidade: REQ-18 · REQ-19
 * Critério T-41:
 *   - Exibe "Offline" quando isOnline = false
 *   - Não renderiza nada quando isOnline = true
 *   - Indicador tem atributo de acessibilidade presente no DOM
 */
describe('OfflineIndicator', () => {
  describe('quando isOnline = true', () => {
    beforeEach(() => {
      mockUseOfflineStatus.mockReturnValue({ isOnline: true });
    });

    it('não renderiza nada', () => {
      const { container } = render(<OfflineIndicator />);
      expect(container).toBeEmptyDOMElement();
    });

    it('não exibe o indicador "Offline"', () => {
      render(<OfflineIndicator />);
      expect(screen.queryByText('Offline')).not.toBeInTheDocument();
    });

    it('não exibe o elemento com data-testid="offline-indicator"', () => {
      render(<OfflineIndicator />);
      expect(screen.queryByTestId('offline-indicator')).not.toBeInTheDocument();
    });
  });

  describe('quando isOnline = false', () => {
    beforeEach(() => {
      mockUseOfflineStatus.mockReturnValue({ isOnline: false });
    });

    it('exibe o texto "Offline"', () => {
      render(<OfflineIndicator />);
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('tem role="status" para leitores de tela', () => {
      render(<OfflineIndicator />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('tem aria-label descritivo', () => {
      render(<OfflineIndicator />);
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-label', 'Sem conexão com a internet');
    });

    it('tem data-testid="offline-indicator"', () => {
      render(<OfflineIndicator />);
      expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
    });

    it('indicador tem atributo de acessibilidade identificável por leitores de tela', () => {
      render(<OfflineIndicator />);
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-label');
    });
  });
});
