# Guia de Verificação — Situações Comuns

## Como identificar quais testes rodar

1. Leia o campo `Rastreabilidade` da task atual — os IDs UT/IT/GH/PT/ST são o índice
2. Use `grep` para extrair apenas os blocos relevantes do `test-strategy.md` — não carregue o arquivo inteiro:
   ```bash
   grep -A 15 "### UT-1:" docs/features/<slug>/test-strategy.md
   grep -A 15 "### IT-3:" docs/features/<slug>/test-strategy.md
   ```
3. Para componentes no `design.md`, extraia apenas a seção do componente:
   ```bash
   grep -A 20 "### NomeDoComponente" docs/features/<slug>/design.md
   ```
4. Para Scenarios no `.feature`, extraia apenas o cenário relevante:
   ```bash
   grep -A 15 'Scenario: "Nome do Scenario"' docs/features/<slug>/scenarios.feature
   ```

**Regra:** se você está carregando um arquivo inteiro para usar 10 linhas, use grep.

---

## Situações de bloqueio e como lidar

### Teste falha por dependência ausente

**Sintoma:** IT falha porque o banco de teste não está rodando; GH falha porque o Redis não está disponível.

**Ação:**
1. Verifique o `CLAUDE.md` — há instrução sobre como subir as dependências de teste?
2. Se sim: siga a instrução e re-execute
3. Se não: use `AskUserQuestion` uma vez: "Para rodar os testes de integração preciso do banco/Redis de teste. Como subir o ambiente?"

---

### Teste falha por componente não implementado ainda

**Sintoma:** GH-3 falha porque depende de T-09 que ainda não foi implementada.

**Ação:**
- Não bloqueie a task por isso
- Implemente o step definition do GH mas registre no relatório:
  ```
  ⚠️  GH-3 implementado mas não executa completamente — depende de T-09
      (POST /request) que ainda não foi implementada.
  ```
- O GH será verificado novamente quando T-09 for implementada

---

### Lint falha por convenção de código não documentada

**Sintoma:** ESLint/TSC aponta erro por regra que não está no `CLAUDE.md`.

**Ação:**
1. Corrija seguindo o padrão do erro (ex: adicionar tipo explícito, ajustar import)
2. Se a correção alterar o design da implementação de forma significativa, registre no relatório
3. Não pergunte ao usuário sobre cada regra de lint — resolva e siga

---

### Constitution.md viola o design natural da task

**Sintoma:** A forma mais direta de implementar a task violaria uma regra da constitution.md (ex: seria mais simples chamar Prisma diretamente no domínio).

**Ação:**
1. **Não viole a constitution.md** — ela tem precedência sobre conveniência
2. Implemente da forma correta (ex: injetar o repository via port)
3. Registre no relatório com ⚠️: "Implementação usa injeção de dependência conforme regra N da constitution.md em vez de acesso direto"

---

### Task tem critério de conclusão ambíguo

**Sintoma:** "Concluída quando: o sistema funciona corretamente" — não é verificável.

**Ação:**
1. Use o campo `Rastreabilidade` para inferir o critério real (o REQ/NFR descreve o comportamento esperado)
2. Implemente e teste contra esse comportamento
3. Registre no relatório: "Critério interpretado como: <o que foi verificado>"

---

### Design.md e task.md divergem

**Sintoma:** A task diz para implementar `findByEmail()` mas o design diz `findByContact(channel, contact)`.

**Ação:**
1. O `design.md` tem precedência — é mais detalhado e foi produzido depois
2. Implemente conforme o `design.md`
3. Registre no relatório: "Implementado como `findByContact()` conforme design.md — task.md usa nome anterior"

---

## Checklist rápido antes de apresentar o relatório

Antes de usar `AskUserQuestion`, confirme:

- [ ] Lint/typecheck passou sem erros?
- [ ] Todos os testes rastreados passaram?
- [ ] O critério "Concluída quando" está satisfeito?
- [ ] A task está marcada `- [x]` no tasks.md?
- [ ] O relatório menciona todos os arquivos criados/editados?
- [ ] O relatório lista todos os testes executados com resultado?
- [ ] Se houve ajuste por constitution.md, está registrado com ⚠️?

Se qualquer item está pendente: resolva antes de apresentar o relatório.
