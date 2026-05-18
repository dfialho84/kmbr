export interface IInstallPort {
  isInstallAvailable(): boolean;
  promptInstall(): Promise<void>;
}
