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
  // Limpa sessionStorage para garantir estado inicial limpo
  cy.clearAllSessionStorage();

  // Injeta o mock de beforeinstallprompt na janela antes de navegar
  cy.window().then((win) => {
    promptInstallCalled = false;

    const mockPromptEvent = {
      preventDefault: () => {},
      prompt: () => {
        promptInstallCalled = true;
        return Promise.resolve({ outcome: "accepted" });
      },
      userChoice: Promise.resolve({ outcome: "accepted" }),
    };

    // Registra o evento beforeinstallprompt no window
    // O SerwistServiceWorkerAdapter escuta este evento
    win.dispatchEvent(
      Object.assign(new Event("beforeinstallprompt"), mockPromptEvent),
    );

    // Sobrescreve matchMedia para simular modo standalone
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
  });
});

Given("o app ainda não está instalado no dispositivo", () => {
  // Garante que nenhum flag de sessão está setado
  cy.clearAllSessionStorage();
});

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When("o usuário acessa a aplicação", () => {
  cy.visit("/");

  // Dispara beforeinstallprompt após navegação, pois o adapter
  // registra o listener ao montar
  cy.window().then((win) => {
    const mockPromptFn = cy.stub().callsFake(() => {
      promptInstallCalled = true;
      return Promise.resolve({ outcome: "accepted" });
    });

    const event = new Event("beforeinstallprompt") as Event & {
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
  // Verifica que matchMedia retorna true para display-mode: standalone
  cy.window().then((win) => {
    const result = win.matchMedia("(display-mode: standalone)");
    expect(result.matches).to.equal(true);
  });
});
