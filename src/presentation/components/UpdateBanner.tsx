'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useUpdateBanner } from '@/presentation/hooks/useUpdateBanner';

/**
 * Componente de apresentação que renderiza o banner de atualização PWA.
 *
 * Renderiza somente quando `showBanner = true` (controlado pelo
 * `useUpdateBanner`). Suporta os estados:
 *   - Oculto: `showBanner = false` — nada é renderizado
 *   - Visível: `showBanner = true` — banner com botões "Atualizar agora" e "Depois"
 *   - Atualizando: clique em "Atualizar agora" em progresso — botão desabilitado
 *   - Oculto após "Depois": `onDefer` chamado — `showBanner` torna-se `false`
 *
 * Os botões têm `aria-label` explícito para acessibilidade por leitores de tela.
 *
 * Rastreabilidade: REQ-7 · REQ-8 · Scenario: "App detecta nova versão e exibe banner de atualização"
 */
export function UpdateBanner(): React.JSX.Element | null {
  const { showBanner, onUpdate, onDefer } = useUpdateBanner();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!showBanner) {
    return null;
  }

  async function handleUpdate(): Promise<void> {
    setIsUpdating(true);
    try {
      await onUpdate();
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      data-testid="update-banner"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 bg-background border-t px-4 py-3 shadow-md"
    >
      <p className="text-sm font-medium">
        Uma nova versão do app está disponível.
      </p>
      <div className="flex shrink-0 gap-2">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Depois"
          onClick={onDefer}
          disabled={isUpdating}
        >
          Depois
        </Button>
        <Button
          variant="default"
          size="sm"
          aria-label="Atualizar agora"
          onClick={() => void handleUpdate()}
          disabled={isUpdating}
        >
          {isUpdating ? 'Atualizando...' : 'Atualizar agora'}
        </Button>
      </div>
    </div>
  );
}
