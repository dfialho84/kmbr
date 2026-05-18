# Guia de Entrevista — Estratégia de Testes

## Princípios

1. **Derive antes de perguntar.** Os artefatos cobrem a maior parte:
   - Métodos de domínio do `design.md` → testes unitários
   - Repositories e adapters do `design.md` → testes de integração
   - Cada Scenario do `.feature` → um teste Gherkin
   - Cada NFR mensurável → um teste de performance
   - Cada NFR de segurança + riscos do PRD → testes de segurança

2. **Uma pergunta por vez.**

3. **Aceite "N/A".** Nem toda feature tem NFRs de performance ou riscos de segurança.

---

## Banco de perguntas por tipo

### Unitários

Use quando um comportamento de domínio não está claro nos artefatos.

- "O método `<método>` tem casos de borda além dos cobertos pelos REQs? (ex: valor nulo, lista vazia, overflow)"
- "Há alguma regra de negócio implícita nos critérios de aceitação das stories que não está explícita nos REQs?"

### Integração

Use quando a estratégia de dependências reais vs. mockadas não está clara.

- "Para os testes de `<AdapterX>`, usamos o serviço externo real em modo sandbox ou um mock local?"
- "O ambiente de CI tem Redis e banco de dados disponíveis, ou precisamos de alternativas in-memory?"
- "O que deve acontecer nos testes se o serviço externo de email/SMS estiver indisponível?"

### E2E Gherkin

Use apenas se o mecanismo de manipulação de estado não estiver claro.

- "Para forçar a expiração do código OTP no teste, manipulamos o banco diretamente ou há um helper de teste?"
- "Os step definitions compartilhados entre Scenarios ficam num arquivo global ou por feature?"

### Performance

Use quando o NFR não especifica threshold suficientemente concreto.

- "O NFR diz `<critério vago>`. Qual é o valor numérico aceitável? (ex: p95, p99, média)"
- "O teste de performance roda em CI em cada PR ou apenas periodicamente?"

### Segurança

Use para riscos do PRD que têm mitigação técnica mas sem NFR correspondente.

- "O PRD menciona o risco de `<risco>`. Há um teste automatizado planejado para verificar a mitigação, ou é verificação manual?"
- "O teste de timing attack para a resposta neutra (NFR-3) verifica apenas o conteúdo da resposta ou também o tempo de resposta?"

---

## O que não perguntar

- O que já está explícito nos Scenarios BDD — cada Scenario é um teste GH, sem confirmação necessária
- O que o NFR já especifica numericamente (threshold, TTL, percentil)
- Quais componentes têm testes unitários — todos os métodos de domínio têm, sem exceção
