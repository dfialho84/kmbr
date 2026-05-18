Feature: Bootstrap — Banner de Atualização PWA

  Scenario: App detecta nova versão e exibe banner de atualização
    Given o app está instalado como PWA
    And há uma nova versão disponível do app
    And a nova versão foi baixada em background
    When o usuário inicia uma nova sessão do app
    Then um banner notifica que há atualização disponível
    And o banner de atualização contém botões "Atualizar agora" e "Depois"
    And a versão anterior continua funcional enquanto o banner é exibido
