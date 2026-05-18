# Requisitos Funcionais — Bootstrap

## Instalação PWA

**REQ-1**: When the user accesses the application and the browser supports PWA installation and the app is not yet installed on the device, the system shall display a visual installation banner.

> Fonte: Fluxo Principal do PRD (passo 2) / Cenário BDD "Usuário instala o app como PWA via banner" / Estória 1, critério 1

**REQ-2**: The system shall include "Instalar" and "Descartar" buttons in the installation banner.

> Fonte: Cenário BDD "Usuário instala o app como PWA via banner" / Estória 1, critério 2

**REQ-3**: When the user clicks "Instalar" in the installation banner, the system shall trigger the browser install prompt and add the app to the device home screen.

> Fonte: Cenário BDD "Usuário instala o app como PWA via banner" / Estória 1, critério 3

**REQ-4**: When the app is installed, the system shall open it in standalone mode without the browser address bar.

> Fonte: Cenário BDD "Usuário instala o app como PWA via banner" / Estória 1, critério 6

**REQ-5**: When the user clicks "Descartar" in the installation banner, the system shall hide the banner for the current session.

> Fonte: Cenário BDD "Usuário descarta banner de instalação" / Estória 1, critério 4

**REQ-6**: While the user has dismissed the installation banner in the current session, the system shall not display the installation banner again.

> Fonte: Cenário BDD "Usuário descarta banner de instalação" / Estória 1, critério 5

## Atualização de Versão

**REQ-7**: When the user starts a new app session and a new version has been downloaded in background, the system shall display an update notification banner with "Atualizar agora" and "Depois" buttons.

> Fonte: Cenário BDD "App detecta nova versão e exibe banner de atualização" / Estória 2, critério 3 / Estória 3

**REQ-8**: While the update banner is displayed, the system shall keep the previous version fully functional.

> Fonte: Cenário BDD "App detecta nova versão e exibe banner de atualização" / Estória 3, critério 1

**REQ-9**: When the user clicks "Atualizar agora", the system shall reload the app loading the new version immediately.

> Fonte: Cenário BDD "Usuário clica Atualizar agora e app recarrega" / Estória 4, critério 1

**REQ-10**: After reloading to a new version, the system shall preserve the user's authenticated session.

> Fonte: Cenário BDD "Usuário clica Atualizar agora e app recarrega" / Estória 4, critério 2

**REQ-11**: When the user clicks "Depois" in the update banner, the system shall hide the banner and continue running the current version.

> Fonte: Cenário BDD "Usuário clica Depois na atualização" / Estória 3, critério 1

**REQ-12**: When the user starts a new session after having clicked "Depois" and the updated version is still available in cache, the system shall display the update banner again.

> Fonte: Cenário BDD "Banner de atualização reaparece na próxima sessão" / Fluxo Alternativo FA1 do PRD / Estória 3, critério 2

**REQ-13**: The system shall check for a new available version on every app startup and periodically during use, at intervals no greater than 60 minutes.

> Fonte: Estória 2, critério 1

**REQ-14**: When a new version is detected, the system shall download the new build in background without interrupting the current user session.

> Fonte: Estória 2, critério 2

**REQ-15**: The system shall only activate a new version after the user confirms the update or at the next app startup, never forcing a reload during an active session.

> Fonte: Estória 2, critério 4

**REQ-16**: If a background update download fails, the system shall not display any technical error to the user and shall retry on the next session.

> Fonte: Estória 2, critério 5

## Funcionamento Offline

**REQ-17**: While the device has no network connection and static assets have been previously cached, the system shall continue rendering the interface and responding to user interactions.

> Fonte: Cenário BDD "App funciona offline com assets em cache" / Estória 5

**REQ-18**: When the network connection is lost, the system shall display a visual "Offline" indicator in the navigation bar or header.

> Fonte: Cenário BDD "App exibe indicador visual de modo offline"

**REQ-19**: When the network connection is restored, the system shall remove the offline indicator.

> Fonte: Cenário BDD "App exibe indicador visual de modo offline"

## Cache Estratégico

**REQ-20**: When the app is accessed for the first time, the system shall cache static assets (HTML, CSS, JavaScript, fonts, icons) to enable faster subsequent startups.

> Fonte: Cenário BDD "App inicializa rapidamente via cache estratégico" / Estória 6, critérios 1–2

**REQ-21**: When a new app version is deployed, the system shall automatically invalidate the cached assets from the previous version.

> Fonte: Cenário BDD "App inicializa rapidamente via cache estratégico" / Estória 6, critério 4

## Compatibilidade de Navegador

**REQ-22**: If the browser does not support PWA installation, the system shall not display the installation banner and shall function as a traditional web app without displaying PWA-related errors.

> Fonte: Cenário BDD "Navegador sem suporte PWA funciona como web app tradicional" / Fluxo Alternativo FA2 do PRD / Estória 7, critérios 2–5
