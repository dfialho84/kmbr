/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InstallBanner } from '@/presentation/components/InstallBanner';

// Mock do hook — isola o componente das dependências de infraestrutura
jest.mock('@/presentation/hooks/useInstallBanner');

import { useInstallBanner } from '@/presentation/hooks/useInstallBanner';

const mockUseInstallBanner = useInstallBanner as jest.MockedFunction<typeof useInstallBanner>;

/**
 * Testes do componente InstallBanner.
 *
 * Rastreabilidade: REQ-1 · REQ-2
 * Critério T-05: renderiza com ambos os botões quando showBanner=true;
 *               não renderiza quando showBanner=false;
 *               botões têm rótulos acessíveis.
 */
describe('InstallBanner', () => {
  describe('quando showBanner = false', () => {
    beforeEach(() => {
      mockUseInstallBanner.mockReturnValue({
        showBanner: false,
        onInstall: jest.fn().mockResolvedValue(undefined),
        onDismiss: jest.fn(),
      });
    });

    it('não renderiza nada', () => {
      const { container } = render(<InstallBanner />);
      expect(container).toBeEmptyDOMElement();
    });

    it('não exibe o botão Instalar', () => {
      render(<InstallBanner />);
      expect(screen.queryByRole('button', { name: /instalar/i })).not.toBeInTheDocument();
    });

    it('não exibe o botão Descartar', () => {
      render(<InstallBanner />);
      expect(screen.queryByRole('button', { name: /descartar/i })).not.toBeInTheDocument();
    });
  });

  describe('quando showBanner = true', () => {
    const mockOnInstall = jest.fn().mockResolvedValue(undefined);
    const mockOnDismiss = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
      mockUseInstallBanner.mockReturnValue({
        showBanner: true,
        onInstall: mockOnInstall,
        onDismiss: mockOnDismiss,
      });
    });

    it('renderiza o banner', () => {
      render(<InstallBanner />);
      expect(screen.getByTestId('install-banner')).toBeInTheDocument();
    });

    it('exibe o botão "Instalar" com rótulo acessível', () => {
      render(<InstallBanner />);
      const btn = screen.getByRole('button', { name: /instalar/i });
      expect(btn).toBeInTheDocument();
    });

    it('exibe o botão "Descartar" com rótulo acessível', () => {
      render(<InstallBanner />);
      const btn = screen.getByRole('button', { name: /descartar/i });
      expect(btn).toBeInTheDocument();
    });

    it('chama onInstall ao clicar "Instalar"', async () => {
      render(<InstallBanner />);
      const btn = screen.getByRole('button', { name: /instalar/i });
      await userEvent.click(btn);
      expect(mockOnInstall).toHaveBeenCalledTimes(1);
    });

    it('chama onDismiss ao clicar "Descartar"', async () => {
      render(<InstallBanner />);
      const btn = screen.getByRole('button', { name: /descartar/i });
      await userEvent.click(btn);
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('banner tem role="banner" e aria-label acessível', () => {
      render(<InstallBanner />);
      const banner = screen.getByRole('banner');
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveAttribute('aria-label');
    });
  });
});
