export interface INetworkPort {
  isOnline(): boolean;
  onStatusChange(callback: (online: boolean) => void): void;
}
