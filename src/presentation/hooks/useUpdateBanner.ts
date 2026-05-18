'use client';

import { useCallback, useEffect, useState } from 'react';

import { UpdateBannerUseCase } from '@/domain/use-cases/UpdateBannerUseCase';
import { SessionStorageAdapter } from '@/infra/adapters/SessionStorageAdapter';
import { SerwistServiceWorkerAdapter } from '@/infra/adapters/SerwistServiceWorkerAdapter';

function createUseCase(): UpdateBannerUseCase {
  const updateAdapter = new SerwistServiceWorkerAdapter();
  const sessionAdapter = new SessionStorageAdapter();
  return new UpdateBannerUseCase(updateAdapter, sessionAdapter);
}

/**
 * Hook React que faz a ponte entre o Domain e o componente {@link UpdateBanner}.
 *
 * Responsabilidades:
 * - Instanciar os adapters de infraestrutura ({@link SerwistServiceWorkerAdapter}
 *   e {@link SessionStorageAdapter}).
 * - Criar o {@link UpdateBannerUseCase} com as dependências injetadas.
 * - Expor `showBanner`, `onUpdate` e `onDefer` tipados para o componente.
 * - Reagir reativamente ao evento de SW em waiting via `onUpdateAvailable`.
 *
 * Não importa Web APIs diretamente — delega ao Domain via Ports.
 *
 * Rastreabilidade: REQ-7 · REQ-8 · REQ-11 · REQ-12
 */
export function useUpdateBanner(): {
  showBanner: boolean;
  onUpdate: () => Promise<void>;
  onDefer: () => void;
} {
  const [useCase] = useState<UpdateBannerUseCase>(createUseCase);

  const [showBanner, setShowBanner] = useState<boolean>(() =>
    useCase.shouldShowBanner(),
  );

  useEffect(() => {
    // Registra callback para quando o SW entra em estado `waiting`.
    // O use case suprime o evento se a flag `updateBannerDismissed` estiver ativa.
    useCase.onUpdateAvailable(() => {
      setShowBanner(useCase.shouldShowBanner());
    });
  }, [useCase]);

  const onUpdate = useCallback(async (): Promise<void> => {
    await useCase.activateUpdate();
    setShowBanner(useCase.shouldShowBanner());
  }, [useCase]);

  const onDefer = useCallback((): void => {
    useCase.defer();
    setShowBanner(useCase.shouldShowBanner());
  }, [useCase]);

  return { showBanner, onUpdate, onDefer };
}
