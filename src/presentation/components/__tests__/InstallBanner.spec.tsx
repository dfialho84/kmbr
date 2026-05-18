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
 * Testes do componente InstallBanner (Dialog shadcn/ui).
 *
 * Rastreabilidade: REQ-1 · REQ-2
 * Critério T-05:
 *   - Dialog abre com título "Instalar aplicativo" quando showBanner=true
 *   - Não renderiza nada quando showBanner=false
 *   - ESC/clique fora fecha o Dialog sem persistir flag (onDismiss não chamado)
 *   - Botão "Agora não" chama onDismiss (persiste flag)
 *   - Botão "Instalar" chama onInstall
 *   - Botões têm rótulos acessíveis verificáveis por query de acessibilidade
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

    it('não exibe o botão Agora não', () => {
      render(<InstallBanner />);
      expect(screen.queryByRole('button', { name: /agora não/i })).not.toBeInTheDocument();
    });

    it('não exibe o dialog', () => {
      render(<InstallBanner />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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

    it('abre o Dialog com role="dialog"', () => {
      render(<InstallBanner />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('exibe o título "Instalar aplicativo"', () => {
      render(<InstallBanner />);
      expect(screen.getByText('Instalar aplicativo')).toBeInTheDocument();
    });

    it('exibe o botão "Instalar" com rótulo acessível', () => {
      render(<InstallBanner />);
      const btn = screen.getByRole('button', { name: /instalar/i });
      expect(btn).toBeInTheDocument();
    });

    it('exibe o botão "Agora não" com rótulo acessível', () => {
      render(<InstallBanner />);
      const btn = screen.getByRole('button', { name: /agora não/i });
      expect(btn).toBeInTheDocument();
    });

    it('chama onInstall ao clicar "Instalar"', async () => {
      render(<InstallBanner />);
      const btn = screen.getByRole('button', { name: /instalar/i });
      await userEvent.click(btn);
      expect(mockOnInstall).toHaveBeenCalledTimes(1);
    });

    it('chama onDismiss ao clicar "Agora não"', async () => {
      render(<InstallBanner />);
      const btn = screen.getByRole('button', { name: /agora não/i });
      await userEvent.click(btn);
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('ESC não chama onDismiss (fechamento silencioso)', async () => {
      render(<InstallBanner />);
      await userEvent.keyboard('{Escape}');
      expect(mockOnDismiss).not.toHaveBeenCalled();
    });

    it('banner tem data-testid acessível', () => {
      render(<InstallBanner />);
      expect(screen.getByTestId('install-banner')).toBeInTheDocument();
    });
  });
});
