Feature: Bootstrap
  Aplicação PWA com suporte a instalação como app nativo, atualização automática e funcionamento offline

  Scenario: Usuário instala o app como PWA via banner
    Given navegador suporta instalação de PWA
    And o app ainda não está instalado no dispositivo
    When o usuário acessa a aplicação
    Then um banner oferecendo instalação é exibido
    And o banner contém botões "Instalar" e "Descartar"
    When o usuário clica em "Instalar"
    Then o app é adicionado à tela inicial do dispositivo
    And o app abre em modo standalone sem barra de endereço

  Scenario: Usuário descarta banner de instalação
    Given navegador suporta instalação de PWA
    And o app ainda não está instalado no dispositivo
    And um banner oferecendo instalação é exibido
    When o usuário clica em "Descartar"
    Then o banner desaparece da tela
    And o banner não reaparece na mesma sessão
    And o app continua funcionando normalmente como web app

  Scenario: App detecta nova versão e exibe banner de atualização
    Given o app está instalado como PWA
    And há uma nova versão disponível do app
    And a nova versão foi baixada em background
    When o usuário inicia uma nova sessão do app
    Then um banner notifica que há atualização disponível
    And o banner contém botões "Atualizar agora" e "Depois"
    And a versão anterior continua funcional enquanto o banner é exibido

  Scenario: Usuário clica "Atualizar agora" e app recarrega
    Given o app está instalado como PWA
    And uma nova versão foi baixada e está pronta
    And um banner de atualização é exibido
    When o usuário clica em "Atualizar agora"
    Then o app faz reload carregando a nova versão imediatamente
    And o usuário permanece autenticado após o reload
    And a interface do app reflete a nova versão (ex: número de build atualizado)

  Scenario: Usuário clica "Depois" na atualização
    Given uma nova versão foi baixada e está pronta
    And um banner de atualização é exibido
    When o usuário clica em "Depois"
    Then o banner desaparece da tela
    And o app continua funcionando com a versão anterior
    And o app continua respondendo normalmente às ações do usuário

  Scenario: Banner de atualização reaparece na próxima sessão
    Given o usuário clicou em "Depois" na sessão anterior
    And uma nova versão continua disponível em cache
    When o usuário inicia uma nova sessão do app
    Then o banner de atualização é exibido novamente
    And o usuário pode clicar em "Atualizar agora" ou "Depois" novamente

  Scenario: App funciona offline com assets em cache
    Given o app já foi acessado e assets estáticos foram cacheados
    And a conexão de rede é interrompida
    When o usuário navega pela aplicação
    Then a interface continua carregando e respondendo
    And o usuário pode visualizar dados locais sem erros técnicos
    And quando a conexão é restaurada, dados sincronizam automaticamente

  Scenario: App exibe indicador visual de modo offline
    Given a conexão de rede é interrompida
    When o app é acessado
    Then um indicador visual "Offline" é exibido na barra de navegação ou header
    And o indicador sinaliza claramente que o app está sem conexão
    And quando a conexão é restaurada, o indicador desaparece

  Scenario: App inicializa rapidamente via cache estratégico
    Given o app já foi acessado e assets foram cacheados
    And o usuário está em conexão 4G
    When o usuário clica no ícone do app instalado
    Then o app abre e fica totalmente interativo em menos de 3 segundos
    And assets estáticos são carregados do cache primeiro
    And o cache é invalidado automaticamente quando há atualização de versão

  Scenario: Navegador sem suporte PWA funciona como web app tradicional
    Given o navegador não suporta instalação de PWA
    When o usuário acessa a aplicação
    Then nenhum banner de instalação é exibido
    And o app funciona com toda a funcionalidade disponível
    And o usuário pode navegar, interagir e usar o app normalmente
    And nenhum erro técnico é exibido relacionado a PWA
