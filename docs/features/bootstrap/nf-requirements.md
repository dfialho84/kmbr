# Requisitos Não Funcionais — Bootstrap

## Performance

**NFR-1**: Em conexão 4G, o sistema deve completar a inicialização do app (do clique no ícone até UI totalmente interativa) em até 3 segundos para 95% das sessões.

> Fonte: PRD — Critério de Sucesso "Cache de assets reduz tempo de inicialização" / Estória 6, critério 3 / Cenário BDD "App inicializa rapidamente via cache estratégico"

**NFR-2**: O sistema deve verificar periodicamente se há nova versão disponível sem bloquear a interface ou degradar a responsividade da aplicação. A verificação deve ser assíncrona e não deve atrasar eventos de interação do usuário em mais de 100 ms.

> Fonte: PRD — Objetivo 2 / Estória 2, critério 2 / Estória 2, critério 4 / Estória 4, critério 5

## Disponibilidade

**NFR-3**: O sistema deve manter pelo menos 95% das funcionalidades críticas operacionais quando a conexão de rede não está disponível, desde que os assets estáticos tenham sido previamente cacheados.

> Fonte: PRD — Objetivo 4 / Critério de Sucesso "App funciona offline" / Estória 5, critério 3 / Cenário BDD "App funciona offline com assets em cache"

## Observabilidade

**NFR-4**: O sistema deve definir um limite máximo de tamanho de cache (sugerido: 50 MB) e remover automaticamente assets e versões antigas quando este limite é atingido, usando estratégia FIFO (first-in, first-out) ou baseada em uso menos recente.

> Fonte: PRD — Riscos "Tamanho de cache cresce indefinidamente..." / Estória 6, critério 5

## Compatibilidade

**NFR-5**: O sistema não deve exibir erros técnicos ou console warnings relacionados a PWA em navegadores que não suportam Service Workers ou instalação de PWA. O app deve funcionar como web app tradicional com toda a funcionalidade disponível, sem necessidade de fallbacks visuais ou mensagens de incompatibilidade.

> Fonte: PRD — Fluxo Alternativo FA2 / Riscos "Navegador do usuário não suporta PWA" / Estória 7, critérios 3–5
