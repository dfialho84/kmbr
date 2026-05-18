/**
 * @jest-environment jsdom
 *
 * IT-1: SessionStorageAdapter — getFlag() e setFlag()
 *
 * Rastreabilidade: REQ-5 · REQ-6 · REQ-11 · REQ-12
 *
 * Dependências reais usadas: sessionStorage do JSDOM.
 */

import { SessionStorageAdapter } from '../SessionStorageAdapter';

describe('SessionStorageAdapter — IT-1', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  /**
   * IT-1 — Caso 1: Flag não existente
   * getFlag() deve retornar false quando a chave não existe no sessionStorage
   */
  it('retorna false para flag inexistente', () => {
    const adapter = new SessionStorageAdapter();

    expect(adapter.getFlag('installBannerDismissed')).toBe(false);
  });

  /**
   * IT-1 — Caso 2: Flag setada como true
   * getFlag() deve retornar true após setFlag() com valor true na mesma sessão
   */
  it('retorna true após setFlag com valor true', () => {
    const adapter = new SessionStorageAdapter();

    adapter.setFlag('installBannerDismissed', true);

    expect(adapter.getFlag('installBannerDismissed')).toBe(true);
  });

  /**
   * IT-1 — Caso 3: Isolamento entre chaves
   * Setar installBannerDismissed não deve afetar updateBannerDismissed
   */
  it('isola chaves independentes — installBannerDismissed não afeta updateBannerDismissed', () => {
    const adapter = new SessionStorageAdapter();

    adapter.setFlag('installBannerDismissed', true);

    expect(adapter.getFlag('updateBannerDismissed')).toBe(false);
  });

  /**
   * IT-1 — Caso 4: Cleanup entre testes
   * sessionStorage é limpo no teardown — flag de teste anterior não persiste
   */
  it('sessionStorage está limpo entre testes (cleanup no teardown)', () => {
    const adapter = new SessionStorageAdapter();

    // Simula estado "limpo" — nenhuma flag deve existir após beforeEach
    expect(adapter.getFlag('installBannerDismissed')).toBe(false);
    expect(adapter.getFlag('updateBannerDismissed')).toBe(false);
  });
});
