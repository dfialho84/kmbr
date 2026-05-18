import type { ISessionPort } from '@/domain/ports/ISessionPort';

/**
 * Adapter de infraestrutura que implementa {@link ISessionPort} usando
 * `sessionStorage` do navegador para persistência de flags de sessão.
 *
 * Escopo de vida: aba do navegador (sessionStorage é limpo ao fechar a aba).
 *
 * Rastreabilidade: REQ-5 · REQ-6 · REQ-11 · REQ-12
 */
export class SessionStorageAdapter implements ISessionPort {
  /**
   * Lê o valor booleano da flag armazenada em `sessionStorage`.
   * Retorna `false` quando a chave não existe ou o valor serializado não é `'true'`.
   */
  getFlag(key: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.sessionStorage.getItem(key) === 'true';
  }

  /**
   * Persiste o valor booleano da flag em `sessionStorage`.
   * O valor é serializado como string (`'true'` ou `'false'`).
   */
  setFlag(key: string, value: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }
    window.sessionStorage.setItem(key, String(value));
  }
}
