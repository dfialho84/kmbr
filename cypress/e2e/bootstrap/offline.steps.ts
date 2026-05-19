/**
 * Step definitions para GH-7 e GH-8:
 * - GH-7: Scenario "App funciona offline com assets em cache"
 * - GH-8: Scenario "App exibe indicador visual de modo offline"
 *
 * Rastreabilidade: REQ-14 · REQ-17 · REQ-18 · REQ-19 · REQ-20 · REQ-21 · NFR-3
 *
 * Estratégia de mock:
 * - Cache API é mockado via `onBeforeLoad` com entradas simuladas de assets estáticos.
 * - `navigator.onLine` é controlado via `Object.defineProperty` na janela do Cypress.
 * - Eventos `online` e `offline` são disparados via `window.dispatchEvent`.
 * - O `NetworkStatusAdapter` registra listeners nesses eventos e notifica o
 *   `OfflineStatusUseCase`, que atualiza o estado do `OfflineIndicator`.
 */

/// <reference types="cypress" />

import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Define `navigator.onLine` na janela do Cypress.
 * Necessário porque `navigator.onLine` é read-only por padrão.
 */
function setOnline(win: Window, value: boolean): void {
  Object.defineProperty(win.navigator, "onLine", {
    value,
    writable: true,
    configurable: true,
  });
}

/**
 * Cria um mock mínimo do Cache API com entradas simuladas de assets estáticos.
 * Retorna um objeto compatível com a interface `CacheStorage`.
 */
function createCacheMock(win: Window): typeof caches {
  const mockResponse = new Response("<html>cached</html>", {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });

  const mockCache = {
    match: cy.stub().resolves(mockResponse),
    matchAll: cy.stub().resolves([mockResponse]),
    add: cy.stub().resolves(undefined),
    addAll: cy.stub().resolves(undefined),
    put: cy.stub().resolves(undefined),
    delete: cy.stub().resolves(true),
    keys: cy.stub().resolves(["/", "/_next/static/css/main.css"]),
  };

  const cacheMock = {
    open: cy.stub().resolves(mockCache),
    has: cy.stub().resolves(true),
    delete: cy.stub().resolves(true),
    keys: cy.stub().resolves(["static-v1"]),
    match: cy.stub().resolves(mockResponse),
  };

  return cacheMock as unknown as typeof caches;
}

// ---------------------------------------------------------------------------
// Estado compartilhado entre steps do cenário
// ---------------------------------------------------------------------------

/** Flag para indicar se o Cache API está mockado com assets. */
let cacheIsPopulated = false;

// ---------------------------------------------------------------------------
// Given — GH-7
// ---------------------------------------------------------------------------

/**
 * GH-7 — Given: o app já foi acessado e assets estáticos foram cacheados
 *
 * Registra a intenção de popular o Cache API antes da visita.
 * O mock efetivo é injetado no step When via `onBeforeLoad`.
 * Rastreabilidade: REQ-14 · REQ-20
 */
Given("o app já foi acessado e assets estáticos foram cacheados", () => {
  cacheIsPopulated = true;
});

/**
 * GH-7 / GH-8 — And: a conexão de rede é interrompida
 *
 * Registra a intenção de simular offline antes da visita.
 * O estado efetivo é aplicado no step When via `onBeforeLoad` ou diretamente
 * na janela quando o step é usado como contexto inicial (GH-8).
 * Rastreabilidade: REQ-17 · REQ-18
 */
Given("a conexão de rede é interrompida", () => {
  // Para GH-8, o estado offline é injetado antes do mount no step When.
  // Para GH-7, o estado é modificado após a visita (já montado).
  // Nenhuma ação aqui — o contexto de cada cenário cuida da injeção.
});

// ---------------------------------------------------------------------------
// When — GH-7
// ---------------------------------------------------------------------------

/**
 * GH-7 — When: o usuário navega pela aplicação
 *
 * Visita a página com:
 * - Cache API mockado com assets estáticos pré-populados
 * - `navigator.onLine = false` para simular ausência de rede
 * - evento `offline` disparado após a hidratação do React
 *
 * Rastreabilidade: REQ-14 · REQ-17 · NFR-3
 */
When("o usuário navega pela aplicação", () => {
  cy.visit("/", {
    onBeforeLoad(win) {
      // Garante que navigator.onLine = true antes da hidratação para evitar
      // que o OfflineIndicator apareça prematuramente em ambientes headless
      // (Electron/Cypress em headless pode ter navigator.onLine = false por padrão).
      setOnline(win, true);

      // Injeta Cache API mockado com assets simulados.
      if (cacheIsPopulated) {
        Object.defineProperty(win, "caches", {
          value: createCacheMock(win),
          writable: true,
          configurable: true,
        });
      }

      // Mock de serviceWorker mínimo para evitar erros de registro.
      const mockRegistration = {
        waiting: null,
        installing: null,
        active: null,
        scope: "/",
        updateViaCache: "none" as ServiceWorkerUpdateViaCache,
        addEventListener: cy.stub(),
        removeEventListener: cy.stub(),
        dispatchEvent: cy.stub(),
        update: cy.stub(),
        unregister: cy.stub().resolves(true),
        showNotification: cy.stub(),
        getNotifications: cy.stub().resolves([]),
        onupdatefound: null,
      };

      const mockServiceWorker = {
        ready: Promise.resolve(mockRegistration),
        controller: null,
        addEventListener: cy.stub(),
        removeEventListener: cy.stub(),
        dispatchEvent: cy.stub(),
        getRegistration: cy.stub().resolves(mockRegistration),
        getRegistrations: cy.stub().resolves([mockRegistration]),
        register: cy.stub().resolves(mockRegistration),
        startMessages: cy.stub(),
        onmessage: null,
        onmessageerror: null,
        oncontrollerchange: null,
      };

      Object.defineProperty(win.navigator, "serviceWorker", {
        value: mockServiceWorker,
        writable: true,
        configurable: true,
      });
    },
  });

  cy.get("body").should("exist");

  // Aguarda hidratação do React e montagem dos hooks (useEffect).
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);

  // Simula perda de conexão após a hidratação.
  cy.window().then((win) => {
    setOnline(win, false);
    win.dispatchEvent(new win.Event("offline"));
  });

  // Aguarda o estado do OfflineIndicator ser atualizado.
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(200);
});

// ---------------------------------------------------------------------------
// Then — GH-7
// ---------------------------------------------------------------------------

/**
 * GH-7 — Then: a interface continua carregando e respondendo
 *
 * Verifica que componentes de UI são renderizados sem erros visíveis.
 * Ausência de telas de erro genéricas (error boundary, 500, etc.).
 * Rastreabilidade: REQ-17
 *
 * Nota: não verificamos cy.get("body").not.contain.text("500") porque o
 * Next.js inclui JSON de React Server Components (com "children":404) em
 * <script> tags inline — o texto "500" pode aparecer no JSON serializado
 * sem representar erro real. Verificamos apenas elementos visíveis.
 */
Then("a interface continua carregando e respondendo", () => {
  // Verifica que o body existe e o conteúdo principal está montado.
  cy.get("body").should("exist");
  cy.get("main").should("exist");

  // Verifica ausência de telas de erro típicas de Next.js em elementos visíveis.
  // Usa seletores específicos para não capturar texto em <script> tags inline.
  cy.get("h1, h2, p, [role='alert']").each(($el) => {
    cy.wrap($el).should("not.contain.text", "Internal Server Error");
    cy.wrap($el).should("not.contain.text", "Application error");
  });
});

/**
 * GH-7 — And: o usuário pode visualizar dados locais sem erros técnicos
 *
 * Verifica que não há mensagens de erro de rede visíveis ao usuário.
 * O indicador offline exibe "Offline" (informação, não erro técnico).
 * Rastreabilidade: REQ-17 · NFR-3
 */
Then("o usuário pode visualizar dados locais sem erros técnicos", () => {
  // Verifica ausência de mensagens de erro técnicas.
  cy.get("body").should("not.contain.text", "NetworkError");
  cy.get("body").should("not.contain.text", "Failed to fetch");
  cy.get("body").should("not.contain.text", "ERR_INTERNET_DISCONNECTED");

  // O indicador offline deve estar visível (estado informativo, não erro).
  cy.get('[data-testid="offline-indicator"]').should("be.visible");
  cy.get('[data-testid="offline-indicator"]').should("contain.text", "Offline");
});

/**
 * GH-7 — And: quando a conexão é restaurada, dados sincronizam automaticamente
 *
 * Restaura `navigator.onLine = true`, dispara evento `online` e verifica
 * que o indicador offline desaparece do DOM.
 * Rastreabilidade: REQ-17 · REQ-19
 */
Then(
  "quando a conexão é restaurada, dados sincronizam automaticamente",
  () => {
    cy.window().then((win) => {
      setOnline(win, true);
      win.dispatchEvent(new win.Event("online"));
    });

    // Aguarda o React processar a mudança de estado.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(200);

    // Indicador offline deve desaparecer quando a conexão é restaurada.
    cy.get('[data-testid="offline-indicator"]').should("not.exist");
  },
);

// ---------------------------------------------------------------------------
// When — GH-8
// ---------------------------------------------------------------------------

/**
 * GH-8 — When: o app é acessado
 *
 * Visita a página com `navigator.onLine = false` injetado via `onBeforeLoad`
 * para simular que o dispositivo já estava offline antes do mount.
 * Rastreabilidade: REQ-18
 */
When("o app é acessado", () => {
  cy.visit("/", {
    onBeforeLoad(win) {
      // Injeta estado offline antes da hidratação do React.
      setOnline(win, false);

      // Mock de serviceWorker mínimo para evitar erros de registro.
      const mockRegistration = {
        waiting: null,
        installing: null,
        active: null,
        scope: "/",
        updateViaCache: "none" as ServiceWorkerUpdateViaCache,
        addEventListener: cy.stub(),
        removeEventListener: cy.stub(),
        dispatchEvent: cy.stub(),
        update: cy.stub(),
        unregister: cy.stub().resolves(true),
        showNotification: cy.stub(),
        getNotifications: cy.stub().resolves([]),
        onupdatefound: null,
      };

      const mockServiceWorker = {
        ready: Promise.resolve(mockRegistration),
        controller: null,
        addEventListener: cy.stub(),
        removeEventListener: cy.stub(),
        dispatchEvent: cy.stub(),
        getRegistration: cy.stub().resolves(mockRegistration),
        getRegistrations: cy.stub().resolves([mockRegistration]),
        register: cy.stub().resolves(mockRegistration),
        startMessages: cy.stub(),
        onmessage: null,
        onmessageerror: null,
        oncontrollerchange: null,
      };

      Object.defineProperty(win.navigator, "serviceWorker", {
        value: mockServiceWorker,
        writable: true,
        configurable: true,
      });
    },
  });

  cy.get("body").should("exist");

  // Aguarda hidratação e useEffects do NetworkStatusAdapter.
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);

  // Dispara evento offline após a hidratação para garantir que os listeners
  // do NetworkStatusAdapter foram registrados antes do evento.
  cy.window().then((win) => {
    win.dispatchEvent(new win.Event("offline"));
  });

  // Aguarda o estado do OfflineIndicator ser atualizado.
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(200);
});

// ---------------------------------------------------------------------------
// Then — GH-8
// ---------------------------------------------------------------------------

/**
 * GH-8 — Then: um indicador visual "Offline" é exibido na barra de navegação ou header
 *
 * Verifica presença do elemento com texto "Offline" no DOM.
 * O `OfflineIndicator` usa `data-testid="offline-indicator"`.
 * Rastreabilidade: REQ-18
 */
Then(
  'um indicador visual "Offline" é exibido na barra de navegação ou header',
  () => {
    cy.get('[data-testid="offline-indicator"]').should("be.visible");
    cy.get('[data-testid="offline-indicator"]').should("contain.text", "Offline");
  },
);

/**
 * GH-8 — And: o indicador sinaliza claramente que o app está sem conexão
 *
 * Verifica atributos de acessibilidade: `role="status"` e `aria-label`.
 * O componente não depende apenas de cor ou ícone para comunicar o estado.
 * Rastreabilidade: REQ-19
 */
Then("o indicador sinaliza claramente que o app está sem conexão", () => {
  cy.get('[data-testid="offline-indicator"]').should(
    "have.attr",
    "role",
    "status",
  );
  cy.get('[data-testid="offline-indicator"]').should(
    "have.attr",
    "aria-label",
  );
});

/**
 * GH-8 — And: quando a conexão é restaurada, o indicador desaparece
 *
 * Dispara evento `online`, seta `navigator.onLine = true` e verifica
 * que o `OfflineIndicator` é removido do DOM.
 * Rastreabilidade: REQ-19
 */
Then("quando a conexão é restaurada, o indicador desaparece", () => {
  cy.window().then((win) => {
    setOnline(win, true);
    win.dispatchEvent(new win.Event("online"));
  });

  // Aguarda o React processar a mudança de estado.
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(200);

  // Indicador offline deve ser removido do DOM.
  cy.get('[data-testid="offline-indicator"]').should("not.exist");
});
