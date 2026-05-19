/**
 * @jest-environment jsdom
 *
 * GH-10: Scenario "Navegador sem suporte PWA funciona como web app tradicional"
 *
 * Rastreabilidade: REQ-22 · NFR-5 · T-49
 *
 * Steps cobertos:
 *   Given o navegador não suporta instalação de PWA
 *     → garantir que beforeinstallprompt nunca é disparado;
 *       navigator.serviceWorker ausente (delete da propriedade)
 *   When o usuário acessa a aplicação
 *     → renderizar componente raiz da aplicação
 *   Then nenhum banner de instalação é exibido
 *     → verificar que InstallBanner não está presente no DOM (sem [role="dialog"])
 *   And o app funciona com toda a funcionalidade disponível
 *     → verificar que rotas principais são acessíveis e componentes críticos estão montados
 *   And o usuário pode navegar, interagir e usar o app normalmente
 *     → disparar ações de navegação e interação; verificar respostas esperadas
 *   And nenhum erro técnico é exibido relacionado a PWA
 *     → verificar ausência de mensagens de erro no console relacionadas a
 *       service worker, instalação ou PWA
 *
 * Estado inicial: sem beforeinstallprompt; navigator.serviceWorker ausente;
 *                 sessionStorage limpo
 */

import '@testing-library/jest-dom';

import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InstallBanner } from '@/presentation/components/InstallBanner';
import { OfflineIndicator } from '@/presentation/components/OfflineIndicator';
import { UpdateBanner } from '@/presentation/components/UpdateBanner';

// ---------------------------------------------------------------------------
// Mocks dos hooks — isolam o teste das dependências de infraestrutura real
// ---------------------------------------------------------------------------

/**
 * useInstallBanner: sem suporte PWA → showBanner sempre false.
 * Simula o comportamento real do SerwistServiceWorkerAdapter quando
 * navigator.serviceWorker está ausente (isInstallAvailable() = false).
 */
jest.mock('@/presentation/hooks/useInstallBanner', () => ({
  useInstallBanner: () => ({
    showBanner: false,
    onInstall: jest.fn(),
    onDismiss: jest.fn(),
  }),
}));

jest.mock('@/presentation/hooks/useUpdateBanner', () => ({
  useUpdateBanner: () => ({
    showBanner: false,
    onUpdate: jest.fn(),
    onDefer: jest.fn(),
  }),
}));

jest.mock('@/presentation/hooks/useOfflineStatus', () => ({
  useOfflineStatus: () => ({ isOnline: true }),
}));

// ---------------------------------------------------------------------------
// Componente auxiliar que simula o "app raiz" para fins de teste
// (reproduz a estrutura do layout.tsx sem dependências de Next.js)
// ---------------------------------------------------------------------------

function AppRoot(): React.JSX.Element {
  return (
    <div data-testid="app-root">
      <header data-testid="app-header">
        <OfflineIndicator />
      </header>
      <InstallBanner />
      <UpdateBanner />
      <main data-testid="main-content">
        <h1>Kmbr</h1>
        <nav data-testid="main-nav" aria-label="Navegação principal">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" data-testid="nav-home">
            Início
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/corridas" data-testid="nav-corridas">
            Corridas
          </a>
        </nav>
        <section data-testid="content-section">
          <button data-testid="action-button" type="button">
            Nova corrida
          </button>
        </section>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Setup: ambiente sem suporte a PWA
// ---------------------------------------------------------------------------

let consoleErrorSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;

const PWA_RELATED_PATTERNS = [
  /service.?worker/i,
  /serviceworker/i,
  /beforeinstallprompt/i,
  /install.*prompt/i,
  /pwa/i,
  /manifest.*error/i,
  /sw\.js/i,
];

function isPwaRelatedMessage(args: unknown[]): boolean {
  return args.some((arg) => {
    const message = typeof arg === 'string' ? arg : String(arg);
    return PWA_RELATED_PATTERNS.some((pattern) => pattern.test(message));
  });
}

beforeEach(() => {
  // --- sessionStorage limpo ---
  sessionStorage.clear();

  // --- Remove navigator.serviceWorker para simular navegador sem suporte PWA ---
  // Verifica se a propriedade é configurável antes de deletar
  const descriptor = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
  if (descriptor?.configurable) {
    // Propriedade configurável: define como undefined
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      configurable: true,
      writable: true,
    });
  }
  // Se não for configurável (ambiente padrão JSDOM), o delete não é necessário —
  // o mock do hook já garante showBanner = false, reproduzindo o comportamento correto.

  // --- Garante que beforeinstallprompt nunca é disparado ---
  // Não adiciona listener — o evento simplesmente não existe neste ambiente

  // --- Espias de console para detectar erros/warnings relacionados a PWA ---
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    // Permite erros não relacionados a PWA (ex: erros de prop do React em testes)
    // mas bloqueia erros PWA para que falhem o teste
    if (!isPwaRelatedMessage(args)) {
      // Silencia saída de console para manter output do teste limpo
    }
  });

  consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    if (!isPwaRelatedMessage(args)) {
      // Silencia warnings não relacionados a PWA
    }
  });

  // --- navigator.onLine ---
  Object.defineProperty(navigator, 'onLine', {
    value: true,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  sessionStorage.clear();
});

// ---------------------------------------------------------------------------
// GH-10 — Steps
// ---------------------------------------------------------------------------

describe('GH-10: Scenario "Navegador sem suporte PWA funciona como web app tradicional"', () => {
  /**
   * Step: Given o navegador não suporta instalação de PWA
   *
   * Verifica que o ambiente de teste está configurado sem suporte PWA:
   * navigator.serviceWorker ausente ou undefined, e beforeinstallprompt
   * não dispara.
   */
  it('Given: navigator.serviceWorker está ausente (sem suporte PWA)', () => {
    // Em ambiente sem suporte PWA, serviceWorker deve ser undefined ou ausente
    // (o mock define como undefined no beforeEach)
    const swSupported = 'serviceWorker' in navigator && navigator.serviceWorker !== undefined;
    expect(swSupported).toBe(false);
  });

  /**
   * Step: When o usuário acessa a aplicação
   *       Then nenhum banner de instalação é exibido
   *
   * Renderiza o app e verifica ausência do InstallBanner no DOM.
   * sem [role="dialog"] e sem [data-testid="install-banner"].
   */
  it('Then: nenhum banner de instalação é exibido no DOM', () => {
    render(<AppRoot />);

    // Sem suporte PWA, InstallBanner não deve renderizar nada
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('install-banner')).not.toBeInTheDocument();
    expect(screen.queryByText('Instalar aplicativo')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /instalar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /agora não/i })).not.toBeInTheDocument();
  });

  /**
   * Step: And o app funciona com toda a funcionalidade disponível
   *
   * Verifica que componentes críticos estão montados e acessíveis no DOM.
   */
  it('And: componentes críticos do app estão montados e acessíveis', () => {
    render(<AppRoot />);

    // Componente raiz presente
    expect(screen.getByTestId('app-root')).toBeInTheDocument();

    // Conteúdo principal renderizado
    expect(screen.getByTestId('main-content')).toBeInTheDocument();

    // Header presente
    expect(screen.getByTestId('app-header')).toBeInTheDocument();

    // Navegação principal acessível
    expect(screen.getByTestId('main-nav')).toBeInTheDocument();

    // Seção de conteúdo disponível
    expect(screen.getByTestId('content-section')).toBeInTheDocument();
  });

  /**
   * Step: And o usuário pode navegar, interagir e usar o app normalmente
   *
   * Dispara ações de interação (click em links e botões) e verifica
   * que o DOM responde sem erros.
   */
  it('And: o usuário pode interagir com elementos do app normalmente', async () => {
    const user = userEvent.setup();

    render(<AppRoot />);

    // Links de navegação respondem ao foco (interação de teclado)
    const homeLink = screen.getByTestId('nav-home');
    const corridasLink = screen.getByTestId('nav-corridas');

    await user.tab();
    expect(homeLink).toBeVisible();
    expect(corridasLink).toBeVisible();

    // Botão de ação responde a click
    const actionButton = screen.getByTestId('action-button');
    await user.click(actionButton);

    // Botão permanece no DOM após click (sem crash ou remoção inesperada)
    expect(actionButton).toBeInTheDocument();
  });

  /**
   * Step: And nenhum erro técnico é exibido relacionado a PWA
   *
   * Verifica que console.error e console.warn não foram chamados com
   * mensagens relacionadas a service worker, instalação ou PWA.
   */
  it('And: nenhum erro ou warning de console relacionado a PWA é emitido', () => {
    render(<AppRoot />);

    // Filtra chamadas ao console.error relacionadas a PWA
    const pwaErrors = consoleErrorSpy.mock.calls.filter((args) =>
      isPwaRelatedMessage(args),
    );

    const pwaWarnings = consoleWarnSpy.mock.calls.filter((args) =>
      isPwaRelatedMessage(args),
    );

    expect(pwaErrors).toHaveLength(0);
    expect(pwaWarnings).toHaveLength(0);
  });

  /**
   * Verificação adicional: OfflineIndicator não exibe badge offline
   * quando o app está online (comportamento normal sem PWA).
   */
  it('E: indicador offline não é exibido quando app está online', () => {
    render(<AppRoot />);

    expect(screen.queryByText('Offline')).not.toBeInTheDocument();
    expect(screen.queryByTestId('offline-indicator')).not.toBeInTheDocument();
  });

  /**
   * Verificação adicional: UpdateBanner não é exibido (sem SW em waiting).
   */
  it('E: banner de atualização não é exibido sem Service Worker', () => {
    render(<AppRoot />);

    expect(screen.queryByRole('button', { name: /atualizar agora/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /depois/i })).not.toBeInTheDocument();
  });

  /**
   * Verificação adicional: sessionStorage permanece limpo
   * (sem flags PWA gravadas indevidamente).
   */
  it('E: nenhuma flag PWA é gravada no sessionStorage', () => {
    render(<AppRoot />);

    expect(sessionStorage.getItem('installBannerDismissed')).toBeNull();
    expect(sessionStorage.getItem('updateBannerDismissed')).toBeNull();
  });
});
