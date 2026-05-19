'use client';

import React from 'react';

import { useOfflineStatus } from '@/presentation/hooks/useOfflineStatus';

/**
 * Componente de apresentação que renderiza o indicador visual "Offline"
 * na barra de navegação ou header.
 *
 * Renderiza somente quando `isOnline = false` (controlado pelo `useOfflineStatus`).
 * Quando a conexão é restaurada, o componente é removido automaticamente.
 *
 * Acessibilidade:
 * - `role="status"` anuncia mudança de estado para leitores de tela
 * - `aria-label` descreve o estado explicitamente
 * - Rótulo textual explícito "Offline" — não depende apenas de cor ou ícone
 *
 * Rastreabilidade: REQ-18 · REQ-19 · Scenario: "App exibe indicador visual de modo offline"
 */
export function OfflineIndicator(): React.JSX.Element | null {
  const { isOnline } = useOfflineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Sem conexão com a internet"
      data-testid="offline-indicator"
      className="flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      Offline
    </div>
  );
}
