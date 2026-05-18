# Estratégia de Testes — Bootstrap

## 1. Testes Unitários

### UT-1: InstallBannerUseCase.shouldShowBanner()

- **O que testa:** Decisão de exibição do banner de instalação com base nas condições combinadas de suporte PWA, estado de instalação e flag de sessão
- **Casos cobertos:**
    - Caminho feliz: `isInstallAvailable()` = `true` e `getFlag('installBannerDismissed')` = `false` → retorna `true`
    - Install indisponível: `isInstallAvailable()` = `false` → retorna `false`
    - Banner descartado na sessão: `getFlag('installBannerDismissed')` = `true` → retorna `false`
    - Ambas condições falsas: retorna `false`
- **Mocks necessários:** `IInstallPort` (mock de `isInstallAvailable`), `ISessionPort` (mock de `getFlag`)
- **Rastreabilidade:** REQ-1 · REQ-5 · REQ-6 · REQ-22

---

### UT-2: InstallBannerUseCase.install()

- **O que testa:** Delegação do prompt de instalação para a porta de infraestrutura
- **Casos cobertos:**
    - Caminho feliz: chama `IInstallPort.promptInstall()` e aguarda resolução
    - `promptInstall()` rejeita: erro é propagado sem captura silenciosa
- **Mocks necessários:** `IInstallPort` (mock de `promptInstall`), `ISessionPort`
- **Rastreabilidade:** REQ-3

---

### UT-3: InstallBannerUseCase.dismiss()

- **O que testa:** Persistência do flag de descarte ao usuário clicar "Descartar"
- **Casos cobertos:**
    - Caminho feliz: chama `ISessionPort.setFlag('installBannerDismissed', true)`
    - Flag é setada com o valor booleano correto (`true`, não string)
- **Mocks necessários:** `IInstallPort`, `ISessionPort` (mock de `setFlag`, spy)
- **Rastreabilidade:** REQ-5 · REQ-6

---

### UT-4: UpdateBannerUseCase.shouldShowBanner()

- **O que testa:** Decisão de exibição do banner de atualização com base no estado do SW e flag de sessão
- **Casos cobertos:**
    - Caminho feliz: `getUpdateReadiness().status` = `'available'` e `getFlag('updateBannerDismissed')` = `false` → retorna `true`
    - SW não em waiting: `status` = `'idle'` → retorna `false`
    - Banner adiado na sessão: `getFlag('updateBannerDismissed')` = `true` → retorna `false`
- **Mocks necessários:** `IUpdatePort` (mock de `getUpdateReadiness`), `ISessionPort` (mock de `getFlag`)
- **Rastreabilidade:** REQ-7 · REQ-8 · REQ-11 · REQ-12

---

### UT-5: UpdateBannerUseCase.activateUpdate()

- **O que testa:** Delegação da ativação da nova versão para a porta de infraestrutura
- **Casos cobertos:**
    - Caminho feliz: chama `IUpdatePort.activateUpdate()` e aguarda resolução
    - `activateUpdate()` rejeita: erro é propagado sem captura silenciosa
- **Mocks necessários:** `IUpdatePort` (mock de `activateUpdate`), `ISessionPort`
- **Rastreabilidade:** REQ-9 · REQ-10

---

### UT-6: UpdateBannerUseCase.defer()

- **O que testa:** Persistência do flag de adiamento ao usuário clicar "Depois"
- **Casos cobertos:**
    - Caminho feliz: chama `ISessionPort.setFlag('updateBannerDismissed', true)`
    - SW em `waiting` permanece inalterado (nenhum método de `IUpdatePort` é chamado)
- **Mocks necessários:** `IUpdatePort` (spy sem chamadas esperadas), `ISessionPort` (mock de `setFlag`)
- **Rastreabilidade:** REQ-11 · REQ-12

---

### UT-7: UpdateBannerUseCase.onUpdateAvailable()

- **O que testa:** Registro e acionamento do callback quando SW entra em estado `waiting`
- **Casos cobertos:**
    - Callback registrado é chamado quando `IUpdatePort.onUpdateAvailable()` dispara
    - Flag `updateBannerDismissed` = `false`: caso de uso propaga o evento
    - Flag `updateBannerDismissed` = `true`: caso de uso suprime o evento (não expõe `updateReady`)
- **Mocks necessários:** `IUpdatePort` (mock de `onUpdateAvailable` com chamada imediata do callback), `ISessionPort`
- **Rastreabilidade:** REQ-7 · REQ-11

---

### UT-8: OfflineStatusUseCase — inicialização e reação a mudanças

- **O que testa:** Exposição do estado de conectividade e reação a mudanças via callback
- **Casos cobertos:**
    - Inicialização: estado inicial reflete `INetworkPort.isOnline()`
    - Callback `online` → `false` disparado: `OfflineStatusUseCase` propaga `isOnline = false`
    - Callback `online` → `true` disparado: `OfflineStatusUseCase` propaga `isOnline = true`
- **Mocks necessários:** `INetworkPort` (mock de `isOnline` e `onStatusChange` com callback capturado)
- **Rastreabilidade:** REQ-17 · REQ-18 · REQ-19

---

## 2. Testes de Integração

### IT-1: SessionStorageAdapter — getFlag() e setFlag()

- **O que testa:** Leitura e escrita de flags de sessão na `sessionStorage` real do ambiente de teste
- **Dependências reais usadas:** `sessionStorage` (JSDOM via Vitest)
- **Casos cobertos:**
    - Flag não existente: `getFlag()` retorna `false`
    - Flag setada como `true`: `getFlag()` retorna `true` na mesma sessão
    - Isolamento entre chaves: setar `installBannerDismissed` não afeta `updateBannerDismissed`
    - Cleanup entre testes: `sessionStorage` é limpo no teardown
- **Setup necessário:** `sessionStorage.clear()` antes de cada teste
- **Rastreabilidade:** REQ-5 · REQ-6 · REQ-11 · REQ-12

---

### IT-2: NetworkStatusAdapter — isOnline() e onStatusChange()

- **O que testa:** Leitura de `navigator.onLine` e disparo de callbacks ao receber eventos `online`/`offline` reais do window
- **Dependências reais usadas:** `navigator.onLine` (JSDOM), eventos `online`/`offline` via `window.dispatchEvent()`
- **Casos cobertos:**
    - Inicialização: `isOnline()` reflete estado atual de `navigator.onLine`
    - Evento `offline` disparado: callback registrado recebe `false`
    - Evento `online` disparado: callback registrado recebe `true`
    - Múltiplos callbacks registrados: todos são notificados
- **Setup necessário:** `navigator.onLine` sobrescrito via `Object.defineProperty`; event listeners removidos no teardown
- **Rastreabilidade:** REQ-17 · REQ-18 · REQ-19

---

### IT-3: SerwistServiceWorkerAdapter — isInstallAvailable() e promptInstall()

- **O que testa:** Captura do evento `beforeinstallprompt` e disparo do prompt nativo
- **Dependências reais usadas:** `window` com evento `beforeinstallprompt` simulado via `window.dispatchEvent()`
- **Casos cobertos:**
    - Antes do evento: `isInstallAvailable()` retorna `false`
    - Após `beforeinstallprompt` disparado: `isInstallAvailable()` retorna `true`
    - `promptInstall()` chama `event.prompt()` na instância capturada
    - Após `promptInstall()` executado: `isInstallAvailable()` retorna `false` (prompt consumido)
- **Setup necessário:** evento `beforeinstallprompt` customizado com mock de `prompt()` e `userChoice`; `navigator.serviceWorker` mockado
- **Rastreabilidade:** REQ-1 · REQ-3

---

### IT-4: SerwistServiceWorkerAdapter — getUpdateReadiness() e onUpdateAvailable()

- **O que testa:** Detecção de SW em estado `waiting` e notificação de callbacks
- **Dependências reais usadas:** `navigator.serviceWorker` simulado com `ServiceWorkerRegistration` contendo SW em `waiting`
- **Casos cobertos:**
    - Sem SW em waiting: `getUpdateReadiness().status` = `'idle'`
    - SW entra em `waiting`: callback registrado via `onUpdateAvailable()` é chamado; `status` = `'available'`
    - `activateUpdate()` envia `postMessage({ type: 'SKIP_WAITING' })` ao SW em waiting
- **Setup necessário:** `navigator.serviceWorker` mockado com `ServiceWorkerRegistration` simulada; mock de `postMessage` no SW em waiting
- **Rastreabilidade:** REQ-7 · REQ-9 · REQ-13 · REQ-15 · REQ-16

---

## 3. Testes E2E Gherkin

### GH-1: Scenario "Usuário instala o app como PWA via banner"

- **Arquivo:** `docs/features/bootstrap/scenarios.feature`
- **Step definitions necessários:**
    - `Given navegador suporta instalação de PWA` → configurar ambiente de teste com suporte a `beforeinstallprompt` (mock do evento disponível)
    - `And o app ainda não está instalado no dispositivo` → garantir que `isInstallAvailable()` retorna `true` e nenhum flag de sessão foi setado
    - `When o usuário acessa a aplicação` → renderizar o componente raiz da aplicação
    - `Then um banner oferecendo instalação é exibido` → verificar que o componente `InstallBanner` está visível no DOM
    - `And o banner contém botões "Instalar" e "Descartar"` → verificar presença dos elementos de botão com os textos exatos
    - `When o usuário clica em "Instalar"` → disparar click no botão "Instalar"
    - `Then o app é adicionado à tela inicial do dispositivo` → verificar que `IInstallPort.promptInstall()` foi chamado
    - `And o app abre em modo standalone sem barra de endereço` → verificar que `window.matchMedia('(display-mode: standalone)')` retorna `true` no mock
- **Steps reutilizáveis de outros Scenarios:** `Given navegador suporta instalação de PWA`, `And o app ainda não está instalado no dispositivo`
- **Estado inicial necessário:** evento `beforeinstallprompt` mockado com `prompt()` que resolve com `{ outcome: 'accepted' }`; `sessionStorage` limpo
- **Rastreabilidade:** REQ-1 · REQ-2 · REQ-3 · REQ-4

---

### GH-2: Scenario "Usuário descarta banner de instalação"

- **Arquivo:** `docs/features/bootstrap/scenarios.feature`
- **Step definitions necessários:**
    - `Given navegador suporta instalação de PWA` → reutilizar step de GH-1
    - `And o app ainda não está instalado no dispositivo` → reutilizar step de GH-1
    - `And um banner oferecendo instalação é exibido` → renderizar app e verificar que `InstallBanner` está visível
    - `When o usuário clica em "Descartar"` → disparar click no botão "Descartar"
    - `Then o banner desaparece da tela` → verificar que `InstallBanner` não está mais visível no DOM
    - `And o banner não reaparece na mesma sessão` → verificar que `sessionStorage.getItem('installBannerDismissed')` = `'true'`; re-renderizar o componente e confirmar que banner permanece oculto
    - `And o app continua funcionando normalmente como web app` → verificar que o componente raiz da aplicação está montado e responsivo
- **Steps reutilizáveis de outros Scenarios:** `Given navegador suporta instalação de PWA`, `And o app ainda não está instalado no dispositivo`, `And um banner oferecendo instalação é exibido`
- **Estado inicial necessário:** evento `beforeinstallprompt` mockado; `sessionStorage` limpo
- **Rastreabilidade:** REQ-5 · REQ-6

---

### GH-3: Scenario "App detecta nova versão e exibe banner de atualização"

- **Arquivo:** `docs/features/bootstrap/scenarios.feature`
- **Step definitions necessários:**
    - `Given o app está instalado como PWA` → mock de `window.matchMedia('(display-mode: standalone)')` retornando `true`
    - `And há uma nova versão disponível do app` → configurar `IUpdatePort.getUpdateReadiness()` para retornar `{ status: 'available' }`
    - `And a nova versão foi baixada em background` → confirmar que o mock do SW contém worker em estado `waiting`
    - `When o usuário inicia uma nova sessão do app` → renderizar componente raiz com `sessionStorage` limpo
    - `Then um banner notifica que há atualização disponível` → verificar que `UpdateBanner` está visível no DOM
    - `And o banner contém botões "Atualizar agora" e "Depois"` → verificar presença dos elementos de botão com os textos exatos
    - `And a versão anterior continua funcional enquanto o banner é exibido` → verificar que o conteúdo principal da aplicação está renderizado junto ao banner
- **Steps reutilizáveis de outros Scenarios:** `Given o app está instalado como PWA`, `And há uma nova versão disponível do app`
- **Estado inicial necessário:** `navigator.serviceWorker` mockado com SW em `waiting`; flag `updateBannerDismissed` ausente na `sessionStorage`
- **Rastreabilidade:** REQ-7 · REQ-8

---

### GH-4: Scenario "Usuário clica Atualizar agora e app recarrega"

- **Arquivo:** `docs/features/bootstrap/scenarios.feature`
- **Step definitions necessários:**
    - `Given o app está instalado como PWA` → reutilizar step de GH-3
    - `And uma nova versão foi baixada e está pronta` → configurar SW mock com worker em `waiting` e `postMessage` spy
    - `And um banner de atualização é exibido` → renderizar app com update disponível e verificar `UpdateBanner` visível
    - `When o usuário clica em "Atualizar agora"` → disparar click no botão "Atualizar agora"
    - `Then o app faz reload carregando a nova versão imediatamente` → verificar que `IUpdatePort.activateUpdate()` foi chamado e `postMessage({ type: 'SKIP_WAITING' })` foi enviado ao SW
    - `And o usuário permanece autenticado após o reload` → verificar que token de autenticação persiste em `localStorage` após o reload mockado
    - `And a interface do app reflete a nova versão (ex: número de build atualizado)` → verificar que o atributo `data-version` no DOM corresponde ao build simulado como novo
- **Steps reutilizáveis de outros Scenarios:** `Given o app está instalado como PWA`, `And um banner de atualização é exibido`
- **Estado inicial necessário:** SW mock com `waiting` worker e `postMessage` spy; token de autenticação em `localStorage`; mock de `window.location.reload`
- **Rastreabilidade:** REQ-9 · REQ-10

---

### GH-5: Scenario "Usuário clica Depois na atualização"

- **Arquivo:** `docs/features/bootstrap/scenarios.feature`
- **Step definitions necessários:**
    - `Given uma nova versão foi baixada e está pronta` → reutilizar step de GH-4
    - `And um banner de atualização é exibido` → reutilizar step de GH-4
    - `When o usuário clica em "Depois"` → disparar click no botão "Depois"
    - `Then o banner desaparece da tela` → verificar que `UpdateBanner` não está mais visível
    - `And o app continua funcionando com a versão anterior` → verificar que `IUpdatePort.activateUpdate()` não foi chamado; SW em `waiting` permanece inalterado
    - `And o app continua respondendo normalmente às ações do usuário` → verificar que elementos interativos do app respondem a eventos após o dismiss
- **Steps reutilizáveis de outros Scenarios:** `And uma nova versão foi baixada e está pronta`, `And um banner de atualização é exibido`
- **Estado inicial necessário:** SW mock com `waiting` worker; `sessionStorage` limpo
- **Rastreabilidade:** REQ-11 · REQ-12

---

### GH-6: Scenario "Banner de atualização reaparece na próxima sessão"

- **Arquivo:** `docs/features/bootstrap/scenarios.feature`
- **Step definitions necessários:**
    - `Given o usuário clicou em "Depois" na sessão anterior` → setar `sessionStorage.setItem('updateBannerDismissed', 'true')` e então limpar a `sessionStorage` para simular nova sessão (ou usar uma segunda instância de contexto de sessão)
    - `And uma nova versão continua disponível em cache` → SW mock com worker ainda em `waiting`
    - `When o usuário inicia uma nova sessão do app` → renderizar componente raiz com nova `sessionStorage` limpa (simular reinicialização de sessão)
    - `Then o banner de atualização é exibido novamente` → verificar que `UpdateBanner` está visível com flag de sessão ausente
    - `And o usuário pode clicar em "Atualizar agora" ou "Depois" novamente` → verificar que ambos os botões estão presentes e clicáveis
- **Steps reutilizáveis de outros Scenarios:** `And uma nova versão continua disponível em cache`
- **Estado inicial necessário:** SW mock com worker em `waiting`; `sessionStorage` limpa para simular nova sessão; mecanismo de "sessão anterior" implementado via setup manual do estado inicial
- **Rastreabilidade:** REQ-11 · REQ-13

---

### GH-7: Scenario "App funciona offline com assets em cache"

- **Arquivo:** `docs/features/bootstrap/scenarios.feature`
- **Step definitions necessários:**
    - `Given o app já foi acessado e assets estáticos foram cacheados` → verificar que o SW registrou assets no cache (mock do Cache API com entradas simuladas)
    - `And a conexão de rede é interrompida` → setar `navigator.onLine = false` e disparar evento `offline` via `window.dispatchEvent(new Event('offline'))`
    - `When o usuário navega pela aplicação` → disparar navegação entre rotas da aplicação
    - `Then a interface continua carregando e respondendo` → verificar que componentes de UI são renderizados sem erros; ausência de telas de erro
    - `And o usuário pode visualizar dados locais sem erros técnicos` → verificar que dados em cache são exibidos sem mensagens de erro de rede
    - `And quando a conexão é restaurada, dados sincronizam automaticamente` → setar `navigator.onLine = true`, disparar evento `online`, verificar que indicador offline desaparece e tentativas de sincronização são disparadas
- **Steps reutilizáveis de outros Scenarios:** `And a conexão de rede é interrompida`
- **Estado inicial necessário:** Cache API mockado com assets estáticos; `navigator.onLine` controlável via `Object.defineProperty`
- **Rastreabilidade:** REQ-14 · REQ-20 · REQ-21

---

### GH-8: Scenario "App exibe indicador visual de modo offline"

- **Arquivo:** `docs/features/bootstrap/scenarios.feature`
- **Step definitions necessários:**
    - `Given a conexão de rede é interrompida` → setar `navigator.onLine = false` e disparar `window.dispatchEvent(new Event('offline'))`
    - `When o app é acessado` → renderizar componente raiz da aplicação
    - `Then um indicador visual "Offline" é exibido na barra de navegação ou header` → verificar presença de elemento com texto "Offline" ou atributo `data-offline` no header/nav
    - `And o indicador sinaliza claramente que o app está sem conexão` → verificar que o indicador tem contraste/visibilidade adequada (atributos de acessibilidade `aria-label` ou `role="status"`)
    - `And quando a conexão é restaurada, o indicador desaparece` → disparar `window.dispatchEvent(new Event('online'))` e setar `navigator.onLine = true`; verificar que o indicador some do DOM
- **Steps reutilizáveis de outros Scenarios:** `Given a conexão de rede é interrompida`
- **Estado inicial necessário:** `navigator.onLine = false` antes da renderização; event listeners de `online`/`offline` ativos
- **Rastreabilidade:** REQ-17 · REQ-18 · REQ-19

---

### GH-9: Scenario "App inicializa rapidamente via cache estratégico"

- **Arquivo:** `docs/features/bootstrap/scenarios.feature`
- **Step definitions necessários:**
    - `Given o app já foi acessado e assets foram cacheados` → Cache API mockado com assets estáticos pré-populados
    - `And o usuário está em conexão 4G` → `navigator.onLine = true`; `navigator.connection` mockado com `effectiveType = '4g'`
    - `When o usuário clica no ícone do app instalado` → simular abertura do app (renderizar componente raiz e medir tempo de mount)
    - `Then o app abre e fica totalmente interativo em menos de 3 segundos` → medir tempo entre início do render e estado interativo via `performance.mark`; verificar que valor é ≤ 3000ms no ambiente de teste com cache simulado
    - `And assets estáticos são carregados do cache primeiro` → verificar que o mock do Cache API teve `match()` chamado antes de qualquer `fetch()` de rede
    - `And o cache é invalidado automaticamente quando há atualização de versão` → simular SW com nova versão; verificar que o cache anterior é limpo via `caches.delete()`
- **Steps reutilizáveis de outros Scenarios:** `Given o app já foi acessado e assets foram cacheados`
- **Estado inicial necessário:** Cache API mockado com respostas instantâneas; `performance` API disponível; `caches.delete()` spy ativo
- **Rastreabilidade:** REQ-22 · NFR-1 · NFR-2

---

### GH-10: Scenario "Navegador sem suporte PWA funciona como web app tradicional"

- **Arquivo:** `docs/features/bootstrap/scenarios.feature`
- **Step definitions necessários:**
    - `Given o navegador não suporta instalação de PWA` → garantir que o evento `beforeinstallprompt` nunca é disparado; `navigator.serviceWorker` ausente ou mockado sem suporte a install
    - `When o usuário acessa a aplicação` → renderizar componente raiz da aplicação
    - `Then nenhum banner de instalação é exibido` → verificar que `InstallBanner` não está presente no DOM
    - `And o app funciona com toda a funcionalidade disponível` → verificar que rotas principais são acessíveis e componentes críticos estão montados
    - `And o usuário pode navegar, interagir e usar o app normalmente` → disparar ações de navegação e interação; verificar respostas esperadas
    - `And nenhum erro técnico é exibido relacionado a PWA` → verificar ausência de mensagens de erro no console e na UI relacionadas a service worker ou instalação
- **Steps reutilizáveis de outros Scenarios:** nenhum
- **Estado inicial necessário:** ambiente sem `beforeinstallprompt`; `navigator.serviceWorker` pode estar presente mas sem evento de install; `sessionStorage` limpo
- **Rastreabilidade:** REQ-23 · REQ-24 · REQ-25

---

## 4. Testes de Performance

### PT-1: Tempo de inicialização com cache — p95 ≤ 3000ms

- **O que mede:** Latência de inicialização completa do app (do mount do componente raiz até estado totalmente interativo) com assets servidos do Cache API
- **Threshold:** ≤ 3000ms no percentil 95
- **Método de medição:** Benchmark via `performance.mark` / `performance.measure` em Vitest com Cache API mockado respondendo instantaneamente; medição do intervalo entre início do render e primeiro evento interativo
- **Número de execuções:** 50 execuções para cálculo do p95
- **Rastreabilidade:** NFR-1

---

### PT-2: Verificação de versão não bloqueia interação — ≤ 100ms de atraso

- **O que mede:** Atraso introduzido pela verificação assíncrona de nova versão no SW sobre eventos de interação do usuário
- **Threshold:** Atraso ≤ 100ms sobre o tempo de resposta de interação basal
- **Método de medição:** Benchmark em Vitest: medir tempo de resposta a um evento de click antes e após ativar o ciclo de verificação do SW mockado; calcular delta
- **Número de execuções:** 30 execuções, comparando mediana com e sem verificação ativa
- **Rastreabilidade:** NFR-2

---

### PT-3: Limpeza automática de cache — operação concluída em ≤ 2000ms

- **O que mede:** Tempo de execução da operação de limpeza de cache (remoção de assets antigos ao atingir limite de 50 MB) usando estratégia FIFO
- **Threshold:** ≤ 2000ms
- **Método de medição:** Benchmark em Vitest com Cache API mockado contendo entradas simuladas acima do limite; medir duração da chamada de limpeza via `performance.measure`
- **Número de execuções:** 20 execuções com volumes variados de entradas (50, 100, 200 entradas)
- **Rastreabilidade:** NFR-4

---

## 5. Testes de Segurança

### ST-1: Cache obsoleto não persiste versão desatualizada após invalidação

- **O que verifica:** O sistema invalida corretamente o cache anterior quando uma nova versão do SW é ativada, impedindo que o usuário continue servido com assets de versão antiga
- **Vetor de ataque simulado:** Cache poisoning por versão obsoleta — SW antigo em cache sendo servido em vez do novo build
- **Casos cobertos:**
    - Novo SW ativado via `SKIP_WAITING`: `caches.delete()` é chamado para o cache da versão anterior antes de qualquer resposta ser servida
    - Assets da versão nova são verificados antes de servir: cache key inclui versão/build hash no nome
    - Fallback para rede quando cache está em transição: nenhum asset da versão antiga é servido após ativação do novo SW
- **Rastreabilidade:** NFR-4 · Risco "Cache obsoleto permite usuário continuar com versão desatualizada"

---

### ST-2: Crescimento irrestrito de cache não compromete storage do dispositivo

- **O que verifica:** O sistema aplica o limite máximo de cache (50 MB) e executa limpeza automática antes de excedê-lo, protegendo o storage do dispositivo do usuário
- **Vetor de ataque simulado:** Esgotamento de storage por acúmulo de versões de cache — múltiplas atualizações de versão sem limpeza
- **Casos cobertos:**
    - Cache abaixo do limite: nenhuma limpeza é disparada
    - Cache atinge o limite de 50 MB: limpeza FIFO é executada automaticamente antes de adicionar novos assets
    - Após limpeza: tamanho total do cache permanece abaixo do limite
    - `caches.delete()` é chamado para caches de versões anteriores ao registrar nova versão do SW
- **Rastreabilidade:** NFR-4 · Risco "Tamanho de cache cresce indefinidamente afetando storage do dispositivo"

---

### ST-3: Falha no download de atualização não expõe versão parcialmente instalada

- **O que verifica:** Em caso de erro ao baixar novo build (rede instável ou servidor indisponível), o app continua servindo exclusivamente a versão anterior íntegra, sem mistura de assets de versões diferentes
- **Vetor de ataque simulado:** Versão híbrida / assets corrompidos — download parcial de novo build com falha intermediária
- **Casos cobertos:**
    - Download interrompido: SW permanece na versão anterior; nenhum asset parcial do novo build é cacheado
    - Servidor indisponível (HTTP 5xx): tentativa é abortada; cache existente permanece íntegro
    - Retentativa na próxima sessão: após falha, nova tentativa de download é feita na sessão seguinte sem acúmulo de estado de erro
- **Rastreabilidade:** Risco "Erro ao baixar atualização de versão (rede instável ou servidor indisponível)"

---

### ST-4: App não expõe erros técnicos de PWA em navegadores incompatíveis

- **O que verifica:** Em navegadores sem suporte a Service Workers ou instalação de PWA, o app não vaza informações técnicas de infraestrutura via console errors, mensagens de UI ou atributos de DOM expostos
- **Vetor de ataque simulado:** Reconhecimento de infraestrutura — identificar via erros expostos se o app depende de SW, quais versões, quais caches existem
- **Casos cobertos:**
    - `navigator.serviceWorker` ausente: zero console errors ou warnings relacionados a SW no carregamento
    - `beforeinstallprompt` nunca disparado: nenhuma mensagem de erro ou fallback visível na UI
    - DOM não contém atributos que exponham versão de build, nome de cache ou estado interno do SW
- **Rastreabilidade:** NFR-5 · Risco "Navegador do usuário não suporta PWA"

---

## Resumo de Cobertura

| Requisito | Unitário       | Integração     | E2E Gherkin    | Performance | Segurança      |
| --------- | -------------- | -------------- | --------------- | ----------- | -------------- |
| REQ-1     | UT-1           | IT-3           | GH-1            | —           | —              |
| REQ-2     | —              | —              | GH-1            | —           | —              |
| REQ-3     | UT-2           | IT-3           | GH-1            | —           | —              |
| REQ-4     | —              | —              | GH-1            | —           | —              |
| REQ-5     | UT-1, UT-3     | IT-1           | GH-2            | —           | —              |
| REQ-6     | UT-1, UT-3     | IT-1           | GH-2            | —           | —              |
| REQ-7     | UT-4, UT-7     | IT-4           | GH-3            | —           | —              |
| REQ-8     | —              | —              | GH-3            | —           | —              |
| REQ-9     | UT-5           | IT-4           | GH-4            | —           | —              |
| REQ-10    | —              | —              | GH-4            | —           | —              |
| REQ-11    | UT-6, UT-7     | IT-1           | GH-5, GH-6      | —           | —              |
| REQ-12    | —              | —              | GH-5, GH-6      | —           | —              |
| REQ-13    | —              | IT-4           | GH-6            | —           | —              |
| REQ-14    | —              | —              | GH-7            | —           | ST-3           |
| REQ-15    | —              | IT-4           | —               | —           | —              |
| REQ-16    | —              | —              | —               | —           | ST-3           |
| REQ-17    | UT-8           | IT-2           | GH-7, GH-8      | —           | —              |
| REQ-18    | —              | IT-2           | GH-8            | —           | —              |
| REQ-19    | —              | IT-2           | GH-8            | —           | —              |
| REQ-20    | —              | —              | GH-7            | —           | —              |
| REQ-21    | —              | —              | GH-7, GH-9      | —           | ST-1           |
| REQ-22    | UT-1           | —              | GH-9, GH-10     | —           | ST-4           |
| NFR-1     | —              | —              | GH-9            | PT-1        | —              |
| NFR-2     | —              | —              | —               | PT-2        | —              |
| NFR-3     | —              | —              | GH-7            | —           | —              |
| NFR-4     | —              | —              | —               | PT-3        | ST-1, ST-2     |
| NFR-5     | —              | —              | GH-10           | —           | ST-4           |

### Lacunas identificadas

- **REQ-2**: sem cobertura unitária ou de integração direta — cobertura garantida via GH-1 (verificação de presença de botões no DOM)
- **REQ-4**: sem cobertura unitária direta — comportamento standalone é verificado no GH-1 via mock de `window.matchMedia`
- **REQ-8**: sem cobertura unitária direta — o comportamento é verificado em GH-3 (versão anterior funcional enquanto banner está visível)
- **REQ-10**: sem cobertura unitária direta — verificado em GH-4 via persistência de token em `localStorage`
- **REQ-12**: coberto por GH-5 (comportamento de sessão) e GH-6 (reaparecimento na nova sessão)
- **REQ-16**: sem teste unitário ou E2E explícito — coberto por ST-3 (falha no download não expõe versão parcial); risco residual mínimo pois o comportamento é de não-ação

### Totais por tipo

| Tipo        | Quantidade |
| ----------- | ---------- |
| Unitários   | 8 (UT-1 a UT-8) |
| Integração  | 4 (IT-1 a IT-4) |
| E2E Gherkin | 10 (GH-1 a GH-10) |
| Performance | 3 (PT-1 a PT-3) |
| Segurança   | 4 (ST-1 a ST-4) |
| **Total**   | **29 testes** |
