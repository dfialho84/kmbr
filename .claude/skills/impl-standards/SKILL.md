---
name: impl-standards
description: >
    Padrões de qualidade para implementação guiada por artefatos SDD. Define
    o ciclo de implementação por task (implementar → verificar estaticamente →
    testar → confirmar critério → relatar → aguardar aprovação), as regras de
    verificação por tipo de teste, o formato do relatório e as condições de
    avanço entre tasks. Use junto com verification-guide e impl-example.
---

# Padrões de Implementação

## O que é o ciclo de implementação

O ciclo de implementação executa as tasks do `tasks.md` **uma por vez**, com
verificação embutida a cada passo. O usuário aprova cada task antes que o agente
avance para a próxima.

A verificação não é opcional e não acontece só no final — ela é parte do ciclo
de cada task.

---

## Posição no fluxo SDD

```
... → design.md → test-strategy.md → tasks.md → [implementação] → código
```

O `impl-agent` consome `tasks.md` e `test-strategy.md` como entrada e produz
código verificado como saída.

---

## Ciclo por task

```
Ler task → Planejar → Implementar + testes → Lint/typecheck
→ Rodar testes rastreados → Verificar critério de conclusão
→ Marcar - [x] → Relatório → Aguardar aprovação
```

Nenhuma etapa pode ser pulada. Se uma etapa falhar, o ciclo retorna para
a etapa de implementação — não avança.

---

## Regras de verificação por tipo de teste

### Testes Unitários (UT-N)

**Quando rodar:** tasks de domínio — métodos que implementam regras de negócio

**Como identificar quais rodar:** campo `Rastreabilidade` da task lista os IDs (ex: `UT-1 · UT-2`). Localize no `test-strategy.md` os blocos `UT-N` correspondentes para saber exatamente o que cada teste verifica.

**Critério de passagem:**
- [ ] Todos os casos do bloco UT no `test-strategy.md` estão cobertos
- [ ] Nenhum teste usa banco, HTTP ou serviço externo (se usar, é sinal de que pertence a IT, não UT)
- [ ] Clock e dependências não-determinísticas estão mockados

**Comando típico:** `npm test -- --testPathPattern="<nome-do-componente>.spec"`

---

### Testes de Integração (IT-N)

**Quando rodar:** tasks de repository, adapter ou qualquer componente de infraestrutura

**Pré-condição:** banco de teste e Redis de teste devem estar disponíveis. Se não estiverem, sinalize no relatório e pergunte ao usuário como proceder.

**Critério de passagem:**
- [ ] Todos os casos do bloco IT no `test-strategy.md` estão cobertos
- [ ] Setup e teardown do estado externo executam corretamente
- [ ] Teste de falha de dependência (ex: Redis indisponível) passa quando aplicável

**Comando típico:** `npm run test:integration -- --testPathPattern="<nome>"`

---

### Testes E2E Gherkin (GH-N)

**Quando rodar:** tasks de endpoint de API — após implementar o controller/handler

**Pré-condição:** todos os componentes do fluxo do Scenario devem estar implementados. Se algum ainda não existe, o GH pode ser implementado mas não vai passar — registre isso no relatório e continue.

**Critério de passagem:**
- [ ] O Scenario do `.feature` executa sem erro
- [ ] Step definitions estão implementados para todos os steps do Scenario
- [ ] Estado inicial do Scenario é criado/destruído corretamente no setup/teardown

**Comando típico:** `npm run test:e2e -- --tags "@<nome-do-scenario>"`

---

### Testes de Performance (PT-N)

**Quando rodar:** tasks que implementam componentes com NFR mensurável (ex: `PasswordService.hash()`, adapters de notificação)

**Critério de passagem:**
- [ ] A métrica medida está dentro do threshold do NFR
- [ ] O número de execuções especificado no `test-strategy.md` foi respeitado
- [ ] O teste é determinístico o suficiente para rodar em CI

**Atenção:** testes de carga pesados (ex: 100 rps por 60s) não devem rodar a cada task — apenas quando a task específica de performance estiver sendo implementada.

---

### Testes de Segurança (ST-N)

**Quando rodar:** tasks que implementam mecanismos de segurança (rate limiter, resposta neutra, invalidação de token)

**Critério de passagem:**
- [ ] O vetor de ataque descrito no `test-strategy.md` foi simulado
- [ ] O sistema respondeu conforme o comportamento esperado (status HTTP, ausência de dado sensível)
- [ ] Nenhuma informação que não deveria ser exposta aparece na resposta

---

## Formato do relatório

O relatório é apresentado via `AskUserQuestion` ao final de cada task. Deve ser
legível em 30 segundos.

```
✅ T-<NN> concluída — <Título>

O que foi feito:
- <caminho/arquivo.ts>: <uma frase>
- <caminho/arquivo.spec.ts>: <uma frase>

Testes executados:
- <UT-N | IT-N | GH-N | PT-N | ST-N>: ✅ <N> casos passaram
- <UT-N | IT-N | GH-N | PT-N | ST-N>: ✅ <N> casos passaram

Rastreabilidade coberta: <REQ-N> · <NFR-N>

Tasks concluídas: <N>/<total>
Próxima: T-<NN> — <Título>

Deseja prosseguir?
```

**Variante com atenção (não bloqueia, mas informa):**
```
✅ T-<NN> concluída — <Título>

O que foi feito: ...

Testes executados: ...

⚠️  Atenção: <situação que merece revisão, ex: "implementação ajustada para
    respeitar regra 3 da constitution.md — domínio não importa Prisma diretamente">

Deseja prosseguir?
```

**Variante com bloqueio (não avança até resolução):**
```
🔴 T-<NN> bloqueada — <Título>

Tentativas de correção: 3
Erro persistente:
  <mensagem de erro relevante — não dump completo>

O que foi tentado:
- <tentativa 1>
- <tentativa 2>
- <tentativa 3>

Necessito de orientação para prosseguir. O que devo fazer?
```

---

## Condições de avanço

O agente **só avança** para a próxima task quando:

1. Lint/typecheck passou sem erros
2. Todos os testes rastreados na task passaram
3. O critério "Concluída quando" está objetivamente satisfeito
4. A task está marcada `- [x]` no `tasks.md`
5. O usuário aprovou via `AskUserQuestion`

Se qualquer condição não for satisfeita, o agente **não avança**.
A única exceção é o bloqueio por erro persistente (3+ tentativas) — nesse caso
o agente apresenta o relatório de bloqueio e aguarda orientação do usuário.

---

## Verificação da constitution.md

Antes de implementar cada task, o agente verifica mentalmente:

| Regra | Verificação |
|-------|-------------|
| Must Do — separação de camadas | O componente está na camada correta? Imports cruzam camadas? |
| Must Do — propagação de erros | Erros são tipados e propagados, não silenciados? |
| Must Do — validação de entradas | Validação ocorre na borda do sistema (controller/adapter)? |
| Must Do — logging | Operações críticas estão sendo logadas? |
| Never Do — lógica fora do domínio | Regra de negócio está no domínio, não no controller? |
| Never Do — erros silenciosos | Nenhum catch vazio ou log-e-continua? |

Se uma violação for detectada **durante** a implementação, corrija antes de prosseguir.
Registre a correção no campo ⚠️ do relatório.

---

## Cobertura de rastreabilidade

Ao final de cada task, confirme:

- Os REQs listados em `Rastreabilidade` estão cobertos pelo código implementado?
- Os NFRs listados em `Rastreabilidade` estão atendidos (ex: NFR-5 = bcrypt ≥ 100ms)?
- Os Scenarios listados têm step definitions implementados?

Se não: implemente o que falta antes de marcar `- [x]`.

---

## Referências

- Guia de verificação por situação: `references/verification-guide.md`
- Exemplo anotado de ciclo completo: `references/impl-example.md`
