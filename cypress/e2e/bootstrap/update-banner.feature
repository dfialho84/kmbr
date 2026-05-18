Feature: Bootstrap — Banner de Atualização PWA

  Scenario: App detecta nova versão e exibe banner de atualização
    Given o app está instalado como PWA
    And há uma nova versão disponível do app
    And a nova versão foi baixada em background
    When o usuário inicia uma nova sessão do app
    Then um banner notifica que há atualização disponível
    And o banner de atualização contém botões "Atualizar agora" e "Depois"
    And a versão anterior continua funcional enquanto o banner é exibido

  Scenario: Usuário clica Atualizar agora e app recarrega
    Given o app está instalado como PWA
    And uma nova versão foi baixada e está pronta
    And um banner de atualização é exibido
    When o usuário clica em "Atualizar agora"
    Then o app faz reload carregando a nova versão imediatamente
    And o usuário permanece autenticado após o reload
    And a interface do app reflete a nova versão
