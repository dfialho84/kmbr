'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useInstallBanner } from '@/presentation/hooks/useInstallBanner';

/**
 * Componente de apresentação que renderiza o banner de instalação PWA
 * usando o componente Dialog do shadcn/ui (Base UI).
 *
 * O Dialog abre somente quando `showBanner = true` (controlado pelo
 * `useInstallBanner`). Apresenta:
 *   - Título: "Instalar aplicativo"
 *   - Descrição: texto explicativo sobre benefícios da instalação
 *   - Botão "Instalar" (variant default) — chama onInstall e salva flag
 *   - Botão "Agora não" (variant outline) — chama onDismiss e salva flag
 *
 * Comportamento de fechamento:
 *   - ESC ou clique fora (onOpenChange) → fecha silenciosamente sem salvar flag
 *   - Botão "Agora não" → chama onDismiss normalmente (salva flag na sessão)
 *
 * Rastreabilidade: REQ-1 · REQ-2 · Scenario: "Usuário instala o app como PWA via banner"
 */
export function InstallBanner(): React.JSX.Element | null {
  const { showBanner, onInstall, onDismiss } = useInstallBanner();

  // onOpenChange é chamado quando ESC ou clique fora fecha o Dialog.
  // Fecha silenciosamente sem persistir a flag — o banner reaparece na próxima visita.
  function handleOpenChange(open: boolean): void {
    if (!open) {
      // Não chama onDismiss — não persiste flag
      // O hook controla showBanner; o fechamento via ESC/overlay é silencioso
    }
  }

  return (
    <Dialog open={showBanner} onOpenChange={handleOpenChange}>
      <DialogContent data-testid="install-banner" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Instalar aplicativo</DialogTitle>
          <DialogDescription>
            Instale o app na sua tela inicial para acesso rápido, uso offline e
            uma experiência mais fluida sem a barra de endereços do navegador.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            aria-label="Agora não"
            onClick={onDismiss}
          >
            Agora não
          </Button>
          <Button
            variant="default"
            aria-label="Instalar"
            onClick={() => void onInstall()}
          >
            Instalar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
