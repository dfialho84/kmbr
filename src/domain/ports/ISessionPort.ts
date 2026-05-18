export interface ISessionPort {
  getFlag(key: string): boolean;
  setFlag(key: string, value: boolean): void;
}
