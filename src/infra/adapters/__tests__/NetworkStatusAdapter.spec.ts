/**
 * @jest-environment jsdom
 *
 * IT-2: NetworkStatusAdapter — isOnline() e onStatusChange()
 *
 * Rastreabilidade: REQ-17 · REQ-18 · REQ-19
 *
 * Dependências reais usadas: navigator.onLine (JSDOM) sobrescrito via
 * Object.defineProperty; eventos online/offline via window.dispatchEvent().
 */

import { NetworkStatusAdapter } from '../NetworkStatusAdapter';

describe('NetworkStatusAdapter — IT-2', () => {
  let adapter: NetworkStatusAdapter;

  /**
   * Sobrescreve navigator.onLine para controlar o estado nos testes.
   */
  function setOnline(value: boolean): void {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => value,
    });
  }

  beforeEach(() => {
    setOnline(true);
    adapter = new NetworkStatusAdapter();
  });

  afterEach(() => {
    adapter.destroy();
    // Restaura o padrão
    setOnline(true);
  });

  /**
   * IT-2 — Caso 1: Inicialização
   * isOnline() deve refletir o estado atual de navigator.onLine
   */
  it('isOnline() reflete navigator.onLine na inicialização (true)', () => {
    setOnline(true);
    const fresh = new NetworkStatusAdapter();

    expect(fresh.isOnline()).toBe(true);

    fresh.destroy();
  });

  it('isOnline() reflete navigator.onLine na inicialização (false)', () => {
    setOnline(false);
    const fresh = new NetworkStatusAdapter();

    expect(fresh.isOnline()).toBe(false);

    fresh.destroy();
  });

  /**
   * IT-2 — Caso 2: Evento offline
   * Callback registrado recebe false quando window dispara evento 'offline'
   */
  it('notifica callback com false ao receber evento offline', () => {
    const callback = jest.fn();

    adapter.onStatusChange(callback);
    setOnline(false);
    window.dispatchEvent(new Event('offline'));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(false);
  });

  /**
   * IT-2 — Caso 3: Evento online
   * Callback registrado recebe true quando window dispara evento 'online'
   */
  it('notifica callback com true ao receber evento online', () => {
    const callback = jest.fn();

    setOnline(false);
    adapter.onStatusChange(callback);
    setOnline(true);
    window.dispatchEvent(new Event('online'));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(true);
  });

  /**
   * IT-2 — Caso 4: Múltiplos callbacks
   * Todos os callbacks registrados são notificados quando o estado muda
   */
  it('notifica todos os callbacks registrados', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();

    adapter.onStatusChange(callback1);
    adapter.onStatusChange(callback2);
    adapter.onStatusChange(callback3);

    setOnline(false);
    window.dispatchEvent(new Event('offline'));

    expect(callback1).toHaveBeenCalledWith(false);
    expect(callback2).toHaveBeenCalledWith(false);
    expect(callback3).toHaveBeenCalledWith(false);
  });

  /**
   * Validação de teardown: event listeners são removidos no destroy()
   * Callbacks não devem ser chamados após destroy()
   */
  it('não invoca callbacks após destroy()', () => {
    const callback = jest.fn();

    adapter.onStatusChange(callback);
    adapter.destroy();

    setOnline(false);
    window.dispatchEvent(new Event('offline'));

    expect(callback).not.toHaveBeenCalled();
  });
});
