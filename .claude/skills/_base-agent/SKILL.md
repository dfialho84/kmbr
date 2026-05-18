---
name: _base-agent
description: >
    Comportamentos compartilhados por todos os agentes SDD: derivação de slug,
    template de verificação de pré-requisitos, loop de construção incremental
    (Anunciar → Rascunho → Apresentar → Avaliar → Perguntar → Salvar) e
    regras universais de entrevista e arquivo.
---

# Comportamentos Base dos Agentes SDD

## Linguagem

Leia `docs/sdd/sdd-config.md` e use o valor de `language` para toda comunicação com o usuário e geração de documentos. Se o arquivo não existir, use o idioma mais natural ao contexto do projeto.

Nunca traduza termos técnicos de TI — eles são sempre mantidos em inglês independente do idioma configurado: API, backend, frontend, endpoint, deploy, branch, commit, pull request, merge, cache, token, bug, framework, pipeline, build, release, feature, sprint, backlog, mock, stub, refactor, hotfix, rollback, CI/CD, log, test, debug.

---

## Derivação de slug

Converta o argumento recebido em slug:
- Minúsculas, espaços e underscores → hífens, remova acentos e caracteres especiais
- Exemplos: `"Cadastro de Usuário"` → `cadastro-de-usuario` | `"Login de entregador"` → `login-entregador`

---

## Template de verificação de pré-requisito

Se um artefato obrigatório não existir, encerre com:
```
[<nome-do-agente>] Erro: <artefato> não encontrado em docs/features/<slug>/<arquivo>.
Execute /create-<comando> <nome da feature> antes de continuar.
```

---

## Loop de construção incremental

Para cada item (seção, estória, requisito, tela, etc.), execute o ciclo na ordem:

**A. Anuncie** — exiba `[Item X/N: <Título>]`.

**B. Rascunho** — derive dos artefatos e do que já foi construído. Não pergunte o que pode ser derivado.

**C. Apresente**:
```
Rascunho:
---
<conteúdo>
---
```

**D. Avalie** — percorra o checklist da skill de referência. Identifique o item mais crítico que falta.

**E. Decida:**
- Todos os itens cobertos → vá para G
- Há itens faltando → vá para F

**F. Pergunte** — UMA pergunta sobre o item mais crítico via `AskUserQuestion`. Incorpore a resposta e volte para C.

**G. Finalize** — escreva com `Edit`, anuncie `✅ Item X concluído.`, avance para o próximo.

---

## Template de finalização

Após completar todos os itens:
1. Leia o arquivo final com `Read`
2. Verifique consistência (contradições, cobertura, vocabulário uniforme)
3. Corrija com `Edit` e informe o usuário se necessário
4. Anuncie com: nome do agente, caminho do arquivo, métricas (total de itens) e próximos passos sugeridos

---

## Regras universais de entrevista

- **Uma pergunta por vez.** Se dois itens estão faltando, escolha o mais crítico.
- **Contextualize.** Não pergunte o que os artefatos já respondem.
- **Aceite "N/A".** Se não se aplica, registre e avance.
- **Derive antes de perguntar.** Perguntas são para lacunas genuínas, não construção do zero.
- **Mostre o rascunho atualizado** após cada resposta do usuário.

---

## Regras universais de arquivo

- Escreva cada item **logo após finalizá-lo** — não acumule para escrever tudo no final.
- Use `Edit` para adicionar seções/itens ao arquivo — nunca `Write` (sobrescreve o que já foi salvo).
- O formato segue exatamente o padrão da skill de referência do agente.

---

## Diagramas Mermaid

Sempre que uma seção envolver fluxos, relações entre componentes ou transições de estado, inclua um diagrama Mermaid adequado:

- Fluxos de controle ou de usuário → `flowchart LR` ou `flowchart TD`
- Sequências de chamadas entre componentes → `sequenceDiagram`
- Relações entre entidades de dados → `erDiagram`
- Transições de estado de uma tela → `stateDiagram-v2`
- Dependências entre tasks ou componentes → `flowchart TD`

**Regra:** o diagrama complementa o texto — não duplica. Se o texto já é autoexplicativo e o diagrama não acrescentaria compreensão, omita.
