'use client';

import { useCallback, useEffect, useState } from 'react';

import { InstallBannerUseCase } from '@/domain/use-cases/InstallBannerUseCase';
import { SessionStorageAdapter } from '@/infra/adapters/SessionStorageAdapter';
import { SerwistServiceWorkerAdapter } from '@/infra/adapters/SerwistServiceWorkerAdapter';

function createUseCase(): InstallBannerUseCase {
  const installAdapter = new SerwistServiceWorkerAdapter();
  const sessionAdapter = new SessionStorageAdapter();
  return new InstallBannerUseCase(installAdapter, sessionAdapter);
}

/**
 * Hook React que faz a ponte entre o Domain e o componente {@link InstallBanner}.
 *
 * Responsabilidades:
 * - Instanciar os adapters de infraestrutura ({@link SerwistServiceWorkerAdapter}
 *   e {@link SessionStorageAdapter}).
 * - Criar o {@link InstallBannerUseCase} com as dependências injetadas.
 * - Expor `showBanner`, `onInstall` e `onDismiss` tipados para o componente.
 *
 * Não importa Web APIs diretamente — delega ao Domain via Ports.
 *
 * Rastreabilidade: REQ-1 · REQ-2
 */
export function useInstallBanner(): {
  showBanner: boolean;
  onInstall: () => Promise<void>;
  onDismiss: () => void;
} {
  const [useCase] = useState<InstallBannerUseCase>(createUseCase);

  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    // Re-avalia após o evento `beforeinstallprompt` ser disparado.
    // O adapter captura o evento e `isInstallAvailable()` passa a retornar `true`.
    const handleInstallPrompt = (): void => {
      setShowBanner(useCase.shouldShowBanner());
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, [useCase]);

  const onInstall = useCallback(async (): Promise<void> => {
    await useCase.install();
    setShowBanner(useCase.shouldShowBanner());
  }, [useCase]);

  const onDismiss = useCallback((): void => {
    useCase.dismiss();
    setShowBanner(useCase.shouldShowBanner());
  }, [useCase]);

  return { showBanner, onInstall, onDismiss };
}
