# Estórias de Usuário — Bootstrap

## Estoria 1 – Instalar app como PWA via banner visual

Como motorista
Eu quero instalar o app como PWA no meu dispositivo a partir de um banner visual
Para que eu possa acessá-lo como um app nativo com ícone na tela inicial

_Critérios de aceitação_:

- O sistema deve exibir um banner visual (não menu nativo do navegador) oferecendo a instalação do PWA quando o navegador suporta PWA e o app ainda não está instalado
- O sistema deve incluir no banner dois botões: "Instalar" e "Descartar"
- Ao clicar em "Instalar", o sistema deve disparar o prompt de instalação do navegador e adicionar o app à tela inicial do dispositivo
- Ao clicar em "Descartar", o banner deve desaparecer da sessão atual
- O sistema não deve exibir o banner novamente na mesma sessão se o usuário clicou em "Descartar"
- O aplicativo instalado deve abrir em modo standalone (sem barra de endereço do navegador)

## Estoria 2 – Detectar e baixar atualização automaticamente em background

Como motorista com app instalado
Eu quero que o app verifique e baixe novas versões automaticamente em background
Para que eu sempre tenha a versão mais recente disponível sem precisar fazer nada

_Critérios de aceitação_:

- O sistema deve verificar se há nova versão disponível a cada inicialização do app e periodicamente durante o uso (a cada 60 minutos, no mínimo)
- O sistema deve baixar o novo build em background sem interromper a sessão do usuário
- O sistema deve armazenar a versão em cache e validar que a versão baixada é diferente da atual antes de notificar o usuário
- O sistema deve ativar a nova versão apenas após o usuário confirmar a atualização ou na próxima inicialização do app (nunca deve forçar reload durante o uso)
- O sistema não deve exibir erros técnicos ao usuário se o download falhar — deve tentar novamente na próxima sessão

## Estoria 3 – Adiar atualização via banner visual

Como motorista
Eu quero adiar uma atualização disponível e continuar usando o app
Para que eu não seja interrompido em um momento crítico

_Critérios de aceitação_:

- O sistema deve exibir um banner visual quando uma nova versão foi baixada e está pronta para usar, com dois botões: "Atualizar agora" e "Depois"
- Ao clicar em "Depois", o banner deve desaparecer da sessão atual e o app deve continuar funcionando com a versão anterior
- O sistema deve exibir o banner de atualização novamente na próxima inicialização do app se a versão atualizada ainda estiver disponível em cache
- O banner não deve reaparecer mais de uma vez por sessão se o usuário continuar clicando "Depois"

## Estoria 4 – Atualizar app imediatamente

Como motorista
Eu quero atualizar o app imediatamente ao clicar em "Atualizar agora"
Para que eu receba correções críticas ou novas funcionalidades sem demora

_Critérios de aceitação_:

- O sistema deve exibir o banner de atualização com botão "Atualizar agora" quando há nova versão disponível
- Ao clicar em "Atualizar agora", o sistema deve fazer reload do app carregando a nova versão imediatamente
- O sistema deve manter o estado da sessão do usuário (autenticação, dados abertos) ou recuperá-lo sem perda de contexto crítico
- Após o reload bem-sucedido, o app deve confirmar visualmente ao usuário que está operando com a nova versão (ex: versão no footer ou número de build atualizado)
- O sistema deve aguardar apenas o tempo necessário antes de fazer o reload, sem forçar comportamento síncrono que trave a interface

## Estoria 5 – Acessar funcionalidades críticas offline

Como motorista em local sem conexão de rede
Eu quero usar as principais funcionalidades do app
Para que eu possa trabalhar mesmo sem internet

_Critérios de aceitação_:

- O sistema deve cachear os assets estáticos (HTML, CSS, JavaScript, imagens do design) para permitir carregamento da interface sem rede
- O sistema deve exibir um indicador visual quando o app está operando em modo offline (ex: badge "Offline" na barra de navegação)
- O sistema deve permitir ao menos 95% das funcionalidades críticas (navegação, visualização de dados locais) sem conexão
- O sistema não deve exibir erros técnicos para requisições que falham por falta de rede — deve exibir mensagem amigável ("Sem conexão" ou "Disponível ao reconectar")
- O sistema deve resincronizar dados assim que a conexão for restaurada, sem ação manual do usuário

## Estoria 6 – Inicializar app rapidamente via cache estratégico

Como motorista com app já instalado
Eu quero que o app inicie rapidamente em sessões subsequentes
Para que eu economize tempo e dados móveis

_Critérios de aceitação_:

- O sistema deve cachear assets estáticos (HTML, CSS, JavaScript, fontes, ícones) na primeira execução
- O sistema deve implementar "cache-first" para assets imutáveis (versionados) e "network-first" para assets dinâmicos
- O tempo total de inicialização do app (do clique no ícone até UI interativa) deve ser menor que 3 segundos em conexão 4G
- O sistema deve invalidar cache automaticamente quando há atualização de versão do app
- O sistema deve definir limite máximo de tamanho de cache (ex: 50 MB) e remover automaticamente assets antigos quando o limite é alcançado

## Estoria 7 – Suportar navegadores sem suporte PWA

Como motorista em navegador sem suporte nativo a PWA
Eu quero usar o app normalmente como web app tradicional
Para que eu não seja bloqueado por limitações do navegador

_Critérios de aceitação_:

- O sistema deve detectar se o navegador suporta Service Workers e PWA install event
- O sistema não deve exibir banner de instalação se o navegador não suporta PWA
- O sistema deve funcionar com toda a funcionalidade disponível como web app tradicional (sem instalação, sem modo offline completo, com recarga de página normal)
- O sistema não deve exibir erros técnicos ou console warnings relacionados a PWA em navegadores legados
- O app deve permanecer totalmente funcional mesmo sem Service Worker ativo

