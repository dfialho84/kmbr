Feature: Bootstrap — Banner de Instalação PWA

  Scenario: Usuário instala o app como PWA via banner
    Given navegador suporta instalação de PWA
    And o app ainda não está instalado no dispositivo
    When o usuário acessa a aplicação
    Then um banner oferecendo instalação é exibido
    And o banner contém botões "Instalar" e "Descartar"
    When o usuário clica em "Instalar"
    Then o app é adicionado à tela inicial do dispositivo
    And o app abre em modo standalone sem barra de endereço
