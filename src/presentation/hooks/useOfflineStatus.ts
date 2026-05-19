'use client';

import { useEffect, useState } from 'react';

import { OfflineStatusUseCase } from '@/domain/use-cases/OfflineStatusUseCase';
import { NetworkStatusAdapter } from '@/infra/adapters/NetworkStatusAdapter';

/**
 * Hook React que faz a ponte entre o Domain e o componente {@link OfflineIndicator}.
 *
 * Responsabilidades:
 * - Instanciar o {@link NetworkStatusAdapter} e o {@link OfflineStatusUseCase}.
 * - Expor `isOnline` booleano para consumo pelo componente.
 * - Reagir reativamente a mudanças de conectividade via `onStatusChange`.
 * - Limpar o adapter no unmount para evitar memory leaks.
 *
 * Não importa Web APIs diretamente — delega ao Domain via Ports.
 *
 * Rastreabilidade: REQ-17 · REQ-18 · REQ-19
 */
export function useOfflineStatus(): { isOnline: boolean } {
  const [adapter] = useState<NetworkStatusAdapter>(() => new NetworkStatusAdapter());
  const [useCase] = useState<OfflineStatusUseCase>(() => new OfflineStatusUseCase(adapter));

  const [isOnline, setIsOnline] = useState<boolean>(() => useCase.isOnline());

  useEffect(() => {
    // Registra callback para mudanças de conectividade.
    useCase.onStatusChange((online: boolean) => {
      setIsOnline(online);
    });

    return () => {
      adapter.destroy();
    };
  }, [useCase, adapter]);

  return { isOnline };
}
