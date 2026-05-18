export type UpdateReadiness = {
  status: 'idle' | 'available' | 'activating';
  waitingSW: ServiceWorker | null;
};

export interface IUpdatePort {
  getUpdateReadiness(): UpdateReadiness;
  onUpdateAvailable(callback: () => void): void;
  activateUpdate(): Promise<void>;
}
