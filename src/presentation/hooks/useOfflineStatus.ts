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
 * O estado inicial é sempre `true` para corresponder ao HTML do servidor (SSR não
 * tem `navigator.onLine`). O estado real é sincronizado via `onStatusChange` logo
 * após o mount, disparando uma transição apenas se o estado real for diferente.
 *
 * Não importa Web APIs diretamente — delega ao Domain via Ports.
 *
 * Rastreabilidade: REQ-17 · REQ-18 · REQ-19
 */
export function useOfflineStatus(): { isOnline: boolean } {
  const [adapter] = useState<NetworkStatusAdapter>(() => new NetworkStatusAdapter());
  const [useCase] = useState<OfflineStatusUseCase>(() => new OfflineStatusUseCase(adapter));

  // Estado inicial sempre `true` para corresponder ao HTML do servidor (sem indicador).
  // O estado real é propagado via onStatusChange após o mount.
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Registra callback para mudanças de conectividade, incluindo a sincronização
    // inicial: o OfflineStatusUseCase armazena o estado real no constructor e o
    // expõe via isOnline(). Ao registrar o callback, disparamos uma leitura explícita
    // para sincronizar o estado React com o estado atual do Domain.
    useCase.onStatusChange(setIsOnline);

    // Aciona a sincronização inicial lendo o estado atual via o próprio use case.
    // Isso é necessário porque o callback só é chamado em mudanças futuras, não
    // no estado inicial. Usamos queueMicrotask para evitar setState síncrono no
    // corpo do efeito, que pode causar cascata de re-renders.
    queueMicrotask(() => {
      setIsOnline(useCase.isOnline());
    });

    return () => {
      adapter.destroy();
    };
  }, [useCase, adapter]);

  return { isOnline };
}
