Feature: Bootstrap — Modo Offline e Indicador Visual

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
