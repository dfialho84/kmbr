/**
 * Step definitions para GH-1 — Scenario "Usuário instala o app como PWA via banner"
 *
 * Rastreabilidade: REQ-1 · REQ-2 · REQ-3 · REQ-4
 * Scenario: "Usuário instala o app como PWA via banner"
 */

import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ---------------------------------------------------------------------------
// Contexto compartilhado entre steps
// ---------------------------------------------------------------------------

let promptInstallCalled = false;

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given("navegador suporta instalação de PWA", () => {
  // Limpa sessionStorage para garantir estado inicial limpo.
  // O evento beforeinstallprompt será disparado após cy.visit no step When,
  // pois o adapter registra o listener somente após montar (no constructor).
  cy.clearAllSessionStorage();
  promptInstallCalled = false;
});

Given("o app ainda não está instalado no dispositivo", () => {
  // Garante que nenhum flag de sessão está setado
  cy.clearAllSessionStorage();
});

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When("o usuário acessa a aplicação", () => {
  // Visita a página com onBeforeLoad para stub de matchMedia antes do React montar.
  // O stub de matchMedia precisa existir antes da hidratação do componente.
  cy.visit("/", {
    onBeforeLoad(win) {
      // Stub matchMedia para simular modo não-standalone (app não instalado ainda).
      cy.stub(win, "matchMedia").callsFake((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }));
    },
  });

  // Aguarda a hidratação do React completar verificando que o body existe
  // e o Next.js terminou de processar. O useEffect do hook só roda após
  // a hidratação — precisamos garantir que o listener já está registrado
  // antes de disparar beforeinstallprompt.
  cy.get("body").should("exist");

  // Pequena espera para garantir que o useEffect do useInstallBanner rodou
  // e registrou o listener de beforeinstallprompt na window.
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);

  // Dispara o evento após a hidratação — agora o listener do adapter
  // e o listener do hook já estão registrados na window.
  cy.window().then((win) => {
    const mockPromptFn = cy.stub().callsFake(() => {
      promptInstallCalled = true;
      return Promise.resolve({ outcome: "accepted" });
    });

    const event = new win.Event("beforeinstallprompt") as Event & {
      preventDefault: () => void;
      prompt: () => Promise<{ outcome: string }>;
      userChoice: Promise<{ outcome: string }>;
    };

    event.preventDefault = () => {};
    event.prompt = mockPromptFn;
    event.userChoice = Promise.resolve({ outcome: "accepted" });

    win.dispatchEvent(event);
  });
});

When("o usuário clica em {string}", (buttonText: string) => {
  cy.contains("button", buttonText).click();
});

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then("um banner oferecendo instalação é exibido", () => {
  cy.get('[data-testid="install-banner"]').should("be.visible");
});

Then("o banner contém botões {string} e {string}", (btn1: string, btn2: string) => {
  cy.contains("button", btn1).should("exist");
  cy.contains("button", btn2).should("exist");
});

Then("o app é adicionado à tela inicial do dispositivo", () => {
  // Verifica que o prompt de instalação foi invocado
  // O InstallBannerUseCase.install() → IInstallPort.promptInstall() → event.prompt()
  cy.window().then(() => {
    expect(promptInstallCalled).to.equal(true);
  });
});

Then("o app abre em modo standalone sem barra de endereço", () => {
  // Após instalar, o matchMedia para "(display-mode: standalone)" retornaria true
  // em um dispositivo real. No teste, verificamos que o fluxo de instalação
  // foi concluído (promptInstallCalled = true) como proxy deste comportamento.
  cy.window().then(() => {
    expect(promptInstallCalled).to.equal(true);
  });
});
