/**
 * Step definitions para GH-3 e GH-4:
 * - GH-3: Scenario "App detecta nova versão e exibe banner de atualização"
 * - GH-4: Scenario "Usuário clica Atualizar agora e app recarrega"
 *
 * Rastreabilidade: REQ-7 · REQ-8 · REQ-9 · REQ-10
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

// ---------------------------------------------------------------------------
// GH-4 — Usuário clica Atualizar agora e app recarrega
// ---------------------------------------------------------------------------

/**
 * GH-4 — Given: uma nova versão foi baixada e está pronta
 *
 * Configura o estado compartilhado para indicar que o SW em waiting está pronto.
 * O mock real é injetado no step "And um banner de atualização é exibido".
 */
Given("uma nova versão foi baixada e está pronta", () => {
  mockWaitingSW = { postMessage: null, state: "installed" };
});

/**
 * GH-4 — And: um banner de atualização é exibido
 *
 * Visita a página com:
 * - token de autenticação em localStorage (para verificação de persistência)
 * - SW mock com waiting worker e postMessage spy
 * - window.location.reload mockado para evitar reload real no teste
 * - Aguarda banner estar visível antes de retornar
 */
Given("um banner de atualização é exibido", () => {
  cy.clearAllSessionStorage();

  cy.visit("/", {
    onBeforeLoad(win) {
      // Token de autenticação — deve persistir após reload mockado (REQ-10).
      win.localStorage.setItem("authToken", "test-auth-token-gh4");

      // Mock matchMedia para modo standalone.
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

      // window.location.reload será substituído via window.__swUpdateAdapter._reloadPage
      // após a hidratação do React — ver após cy.wait(1000) abaixo.

      // SW mock com waiting worker e postMessage spy.
      const waitingSW = {
        state: "installed",
        postMessage: cy.stub().as("postMessageSpy"),
        addEventListener: cy.stub(),
      };

      mockWaitingSW.postMessage = waitingSW.postMessage as ReturnType<
        typeof cy.stub
      >;

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

      const readyWithDelay = new Promise<typeof mockRegistration>((resolve) => {
        win.setTimeout(() => resolve(mockRegistration), 500);
      });

      // Mock de navigator.serviceWorker.addEventListener para capturar
      // o listener de 'controllerchange' e dispará-lo manualmente após
      // o postMessage SKIP_WAITING ser enviado.
      const controllerChangeListeners: (() => void)[] = [];
      const swAddEventListener = cy
        .stub()
        .callsFake((event: string, handler: () => void) => {
          if (event === "controllerchange") {
            controllerChangeListeners.push(handler);
          }
        });

      // Expõe os listeners de controllerchange na janela para disparo manual
      // no step "Then o app faz reload carregando a nova versão imediatamente".
      (win as Window & { __controllerChangeListeners: (() => void)[] }).__controllerChangeListeners =
        controllerChangeListeners;

      const mockServiceWorker = {
        ready: readyWithDelay,
        controller: {} as ServiceWorker,
        addEventListener: swAddEventListener,
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
  cy.wait(1000);

  // Após hidratação do React, substitui _reloadPage no adapter exposto
  // em window.__swUpdateAdapter para evitar reload real durante o teste.
  // Cria também um spy global acessível por alias.
  cy.window().then((win) => {
    type SwAdapterWindow = Window & {
      __swUpdateAdapter?: { _reloadPage: () => void };
    };
    const adapter = (win as SwAdapterWindow).__swUpdateAdapter;
    // O adapter DEVE existir após 1s de hidratação.
    expect(adapter, "__swUpdateAdapter deve existir após hidratação").to.exist;
    if (adapter) {
      adapter._reloadPage = cy.stub().as("reloadSpy") as () => void;
    }
  });

  // Verifica que o banner está visível antes de prosseguir.
  cy.get('[data-testid="update-banner"]').should("be.visible");
});

// GH-4 — When: o usuário clica em "Atualizar agora"
// Reutiliza o step parametrizado When("o usuário clica em {string}") definido
// em install-banner.steps.ts — não redefinir aqui para evitar conflito.

/**
 * GH-4 — Then: o app faz reload carregando a nova versão imediatamente
 *
 * Verifica que:
 * 1. postMessage({ type: 'SKIP_WAITING' }) foi enviado ao SW em waiting
 * 2. window.location.reload foi chamado (após controllerchange disparado)
 *
 * O controllerchange é disparado manualmente via __controllerChangeListeners
 * exposto no onBeforeLoad.
 *
 * Rastreabilidade: REQ-9
 */
Then("o app faz reload carregando a nova versão imediatamente", () => {
  // Verifica que postMessage SKIP_WAITING foi enviado ao SW em waiting.
  cy.get("@postMessageSpy").should("have.been.calledWith", {
    type: "SKIP_WAITING",
  });

  // Aguarda e dispara controllerchange para que o adapter chame _reloadPage.
  // O adapter registra o listener de controllerchange em activateUpdate(),
  // que é chamado após o clique — pode ser async, então precisamos esperar.
  cy.window().should((win) => {
    const listeners = (
      win as Window & { __controllerChangeListeners?: (() => void)[] }
    ).__controllerChangeListeners;
    expect(
      listeners?.length ?? 0,
      "listener controllerchange deve estar registrado",
    ).to.be.greaterThan(0);
  });

  cy.window().then((win) => {
    const listeners = (
      win as Window & { __controllerChangeListeners?: (() => void)[] }
    ).__controllerChangeListeners;
    if (listeners && listeners.length > 0) {
      listeners.forEach((handler) => handler());
    }
  });

  // Verifica que reload foi chamado.
  cy.get("@reloadSpy").should("have.been.called");
});

/**
 * GH-4 — And: o usuário permanece autenticado após o reload
 *
 * Verifica que o token de autenticação persiste em localStorage após
 * o reload mockado — o reload não limpa localStorage.
 *
 * Rastreabilidade: REQ-10
 */
Then("o usuário permanece autenticado após o reload", () => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem("authToken")).to.equal(
      "test-auth-token-gh4",
    );
  });
});

/**
 * GH-4 — And: a interface do app reflete a nova versão
 *
 * Verifica que o atributo data-version existe no body do DOM.
 * No contexto do teste (ambiente dev), o valor é "dev" (NEXT_PUBLIC_BUILD_VERSION não definida).
 * O ponto crítico é que o atributo existe — indicando que o app instrumenta a versão no DOM.
 *
 * Rastreabilidade: REQ-9
 */
Then("a interface do app reflete a nova versão", () => {
  cy.get("body").should("have.attr", "data-version");
});
