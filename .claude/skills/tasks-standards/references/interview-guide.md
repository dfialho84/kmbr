# Guia de Refinamento do Índice — Tasks

## Quando usar este guia

Este guia é usado **apenas no Passo 1** — quando o agente propõe o índice e aguarda
confirmação. O Passo 2 (geração) não tem perguntas: tudo é derivado dos artefatos.

---

## O que verificar antes de propor o índice

Antes de apresentar o índice ao usuário, verifique internamente:

**Granularidade:**
- Algum bloco de REQ tem uma task "implementar o componente X" que na verdade cobre 3 métodos independentes? → quebrar
- Alguma task é pequena demais para ter valor individual e sempre anda com outra? → mesclar

**Cobertura:**
- Há ao menos 1 task por REQ? Por NFR? Por Scenario?
- Adapters de serviços externos (email, SMS) têm tasks separadas?
- Tasks de schema de validação existem para cada endpoint com payload?

**Agrupamento:**
- Cada NFR está no bloco do REQ ao qual seu campo `Fonte` aponta?
- Tasks de teste estão no bloco do REQ que o Scenario cobre?

---

## Perguntas para usar com o usuário

Use apenas se identificar lacunas genuínas — não pergunte o que já está nos artefatos.

### Sobre escopo
- "O design menciona `<ServiçoExterno>` — devo incluir uma task de configuração de credenciais/variáveis de ambiente para ele?"
- "A `doc/constitution.md` exige `<regra>`. Há algum artefato de verificação (lint, teste de arquitetura) que deva virar task?"

### Sobre granularidade
- "`<ComponenteX>` tem os métodos `save()`, `findValid()` e `markAsUsed()`. Prefere uma task por método ou uma task para o componente inteiro?"
- "As tasks T-XX e T-YY implementam comportamentos sempre feitos juntos pelo mesmo desenvolvedor. Faz sentido mesclá-las?"

### Sobre agrupamento
- "O NFR-N não referencia nenhum REQ diretamente. Devo colocá-lo no bloco de NFRs avulsos ou associá-lo ao REQ-N que parece mais próximo?"

---

## Como incorporar ajustes do usuário

| Pedido | Como agir |
|--------|-----------|
| "Adicione task para X" | Insira no bloco correto, atribua ID provisório, atualize o total |
| "Remova a task Y" | Remova e verifique se outra task dependia dela |
| "Mescle X e Y" | Combine num único item, mantenha o ID menor, descarte o maior |
| "Separe X em duas" | Adicione o segundo ID, ajuste dependências |
| "Mova X para o bloco do REQ-N" | Mova e verifique se o agrupamento ainda faz sentido |

Após incorporar, mostre o índice revisado completo e confirme antes de avançar.

---

## O que não perguntar

- Rastreabilidade — derivada dos artefatos, preenchida na geração
- Estimativas — fora do escopo do tasks.md
- Responsáveis — fora do escopo do tasks.md
- O que já está explícito no design ou nos requisitos
