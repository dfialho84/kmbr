/**
 * Step definitions para GH-3:
 * - GH-3: Scenario "App detecta nova versão e exibe banner de atualização"
 *
 * Rastreabilidade: REQ-7 · REQ-8
 *
 * Estratégia de mock:
 * O `SerwistServiceWorkerAdapter` usa `navigator.serviceWorker.ready` (Promise)
 * para detectar SW em `waiting`. O mock é injetado via `onBeforeLoad` antes do
 * React hidratar — garantindo que o adapter leia o mock ao instanciar.
 *
 * O SW em waiting é simulado por um objeto que implementa a interface mínima
 * de `ServiceWorker` exigida pelo adapter (`postMessage`).
 */

import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ---------------------------------------------------------------------------
// Estado compartilhado entre steps do cenário
// ---------------------------------------------------------------------------

/** SW mock com estado `waiting` para simular atualização disponível. */
let mockWaitingSW: {
  postMessage: ReturnType<typeof cy.stub> | null;
  state: string;
} = { postMessage: null, state: "installed" };

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

/**
 * GH-3 — Given: o app está instalado como PWA
 * Mock de `window.matchMedia` retornando `true` para `(display-mode: standalone)`.
 * Configurado antes da visita — o step When injeta via `onBeforeLoad`.
 */
Given("o app está instalado como PWA", () => {
  // Estado será injetado no onBeforeLoad do step When.
  // Apenas reseta o estado compartilhado.
  mockWaitingSW = { postMessage: null, state: "installed" };
});

/**
 * GH-3 — And: há uma nova versão disponível do app
 * Marca que `IUpdatePort.getUpdateReadiness()` deve retornar `{ status: 'available' }`.
 * Concretizado pelo mock de `navigator.serviceWorker.ready` com SW em `waiting`.
 */
Given("há uma nova versão disponível do app", () => {
  // A disponibilidade é determinada pela presença de `registration.waiting`.
  // O mock é configurado em conjunto com o step seguinte.
});

/**
 * GH-3 — And: a nova versão foi baixada em background
 * Configura o mock do SW em `waiting` que será injetado no `onBeforeLoad`.
 */
Given("a nova versão foi baixada em background", () => {
  // O mock efetivo é injetado no step When via onBeforeLoad.
  // Aqui apenas confirmamos que o estado está pronto.
  mockWaitingSW.state = "installed";
});

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

/**
 * GH-3 — When: o usuário inicia uma nova sessão do app
 *
 * Renderiza o componente raiz com:
 * - `sessionStorage` limpo (sem `updateBannerDismissed`)
 * - `navigator.serviceWorker` mockado com SW em `waiting`
 * - `window.matchMedia` mockado para modo standalone
 */
When("o usuário inicia uma nova sessão do app", () => {
  cy.clearAllSessionStorage();

  cy.visit("/", {
    onBeforeLoad(win) {
      // Mock matchMedia para simular modo standalone (PWA instalado).
      cy.stub(win, "matchMedia").callsFake((query: string) => ({
        matches: query === "(display-mode: standalone)",
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }));

      // SW mock com estado `waiting` — simula atualização disponível.
      const waitingSW = {
        state: "installed",
        postMessage: cy.stub().as("postMessageSpy"),
        addEventListener: cy.stub(),
      };

      // Salva referência ao stub para verificações posteriores.
      mockWaitingSW.postMessage = waitingSW.postMessage as ReturnType<
        typeof cy.stub
      >;

      // Mock de ServiceWorkerRegistration com `waiting` preenchido.
      const mockRegistration = {
        waiting: waitingSW,
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

      // Mock de navigator.serviceWorker.
      // O adapter chama `navigator.serviceWorker.ready` (retorna Promise<Registration>)
      // e `navigator.serviceWorker.addEventListener('controllerchange', ...)`.
      //
      // IMPORTANTE: o `ready` precisa resolver com delay suficiente para o
      // `useEffect` do hook registrar os callbacks via `onUpdateAvailable()`
      // antes de `handleWaitingSW` ser chamado. Sem o delay, o array de
      // callbacks ainda estaria vazio no momento da resolução da Promise.
      const readyWithDelay = new Promise<typeof mockRegistration>((resolve) => {
        win.setTimeout(() => resolve(mockRegistration), 500);
      });

      const mockServiceWorker = {
        ready: readyWithDelay,
        controller: {} as ServiceWorker,
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

      // Sobrescreve navigator.serviceWorker com o mock.
      Object.defineProperty(win.navigator, "serviceWorker", {
        value: mockServiceWorker,
        writable: true,
        configurable: true,
      });
    },
  });

  // Aguarda hidratação do React e execução dos useEffects.
  cy.get("body").should("exist");

  // O adapter usa `navigator.serviceWorker.ready.then(...)` — como a Promise
  // é resolvida microtask (não macrotask), precisamos de uma pequena espera
  // para que o React processe o setState resultante.
  cy.wait(1000);
});

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

/**
 * GH-3 — Then: um banner notifica que há atualização disponível
 * Verifica que o `UpdateBanner` está visível no DOM com `data-testid="update-banner"`.
 */
Then("um banner notifica que há atualização disponível", () => {
  cy.get('[data-testid="update-banner"]').should("be.visible");
});

/**
 * GH-3 — And: o banner de atualização contém botões "Atualizar agora" e "Depois"
 * Verifica presença dos botões com os textos exatos dentro do update-banner.
 */
Then(
  'o banner de atualização contém botões "Atualizar agora" e "Depois"',
  () => {
    cy.get('[data-testid="update-banner"]').within(() => {
      cy.contains("button", "Atualizar agora").should("exist");
      cy.contains("button", "Depois").should("exist");
    });
  },
);

/**
 * GH-3 — And: a versão anterior continua funcional enquanto o banner é exibido
 * Verifica que o conteúdo principal da aplicação está renderizado junto ao banner.
 * Rastreabilidade: REQ-8
 */
Then(
  "a versão anterior continua funcional enquanto o banner é exibido",
  () => {
    // Banner está visível
    cy.get('[data-testid="update-banner"]').should("be.visible");

    // Conteúdo principal também está renderizado simultaneamente
    cy.get("main").should("exist");
  },
);
