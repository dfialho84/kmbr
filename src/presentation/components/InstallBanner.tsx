'use client';

import { useInstallBanner } from '@/presentation/hooks/useInstallBanner';

/**
 * Componente de apresentação que renderiza o banner de instalação PWA.
 *
 * Renderiza o banner somente quando `showBanner = true` (controlado pelo
 * `useInstallBanner`). Apresenta os botões "Instalar" e "Descartar" com
 * rótulos textuais explícitos acessíveis por leitores de tela.
 *
 * Estados suportados:
 * - Oculto: `showBanner = false` — nada é renderizado
 * - Visível: `showBanner = true` — banner com botões "Instalar" e "Descartar"
 * - Instalando: usuário clicou "Instalar" — delegado ao hook
 * - Oculto após descartar: hook atualiza `showBanner = false`
 *
 * Rastreabilidade: REQ-1 · REQ-2 · Scenario: "Usuário instala o app como PWA via banner"
 */
export function InstallBanner(): React.JSX.Element | null {
  const { showBanner, onInstall, onDismiss } = useInstallBanner();

  if (!showBanner) {
    return null;
  }

  return (
    <div
      role="banner"
      aria-label="Banner de instalação do app"
      data-testid="install-banner"
    >
      <p>Instale o app na sua tela inicial para acesso rápido.</p>
      <button
        type="button"
        aria-label="Instalar"
        onClick={() => void onInstall()}
      >
        Instalar
      </button>
      <button
        type="button"
        aria-label="Descartar"
        onClick={onDismiss}
      >
        Descartar
      </button>
    </div>
  );
}
