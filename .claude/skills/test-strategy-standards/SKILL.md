---
name: test-strategy-standards
description: >
    Padrões de qualidade para criação de test-strategy.md por feature. Define
    os 5 tipos de teste obrigatórios (unitários, integração, E2E Gherkin,
    performance, segurança), as fontes de derivação de cada tipo a partir dos
    artefatos SDD, critérios de qualidade, formato esperado e cobertura mínima.
    Use junto com interview-guide e test-strategy-example como régua de qualidade.
---

# Padrões de Estratégia de Testes

## Especificação de formato

> Se `docs/sdd/test-strategy-format.md` existir no projeto, leia-o e use-o como especificação de formato — ele substitui o formato padrão abaixo e pode ter sido customizado para este projeto.

## Formato padrão

### O que é o test-strategy.md

O `test-strategy.md` especifica **quais testes devem existir** para uma feature,
organizados por tipo, com rastreabilidade aos artefatos que os originaram.

Não é um plano de execução nem um relatório de cobertura — é a especificação
dos testes antes de implementá-los, análoga ao `requirements.md` para o código.

---

## Posição no fluxo SDD

```
constitution.md → prd.md → stories.md → scenarios.feature
→ requirements.md → nf-requirements.md → design.md
→ test-strategy.md → tasks.md
```

O `test-strategy.md` é produzido **após o design** e **antes das tasks**.
O `tasks-agent` lê o `test-strategy.md` para gerar as tasks de teste.

---

## Os 5 tipos de teste e suas fontes

| Tipo        | Fonte primária                                               | O que testa                                                     |
| ----------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| Unitário    | `design.md` → métodos de domínio                             | Regras de negócio isoladas, sem dependências externas           |
| Integração  | `design.md` → repositories e adapters                        | Componente + dependências reais (banco, Redis, serviço externo) |
| E2E Gherkin | `scenarios.feature`                                          | Fluxo completo da API via step definitions executáveis          |
| Performance | `nf-requirements.md` → NFRs mensuráveis                      | Métricas de latência, throughput, tempo de operação             |
| Segurança   | `nf-requirements.md` → NFRs de segurança + `prd.md` → Riscos | Rate limiting, timing attacks, enumeração, reuso de tokens      |

---

## Estrutura obrigatória

```markdown
# Estratégia de Testes — <Nome da Feature>

## 1. Testes Unitários

...

---

## 2. Testes de Integração

...

---

## 3. Testes E2E Gherkin

...

---

## 4. Testes de Performance

...
Testes E2E Gherkin

---

## 5. Testes de Segurança

...

---

## Resumo de Cobertura

...
```

---

## Formato por tipo

### 1. Testes Unitários

**Propósito:** Verificar regras de negócio em isolamento total — sem banco, HTTP ou serviço externo.

**Formato:**

```markdown
### UT-<N>: <NomeDoComponente>.<método>()

- **O que testa:** <comportamento esperado>
- **Casos cobertos:**
    - Caminho feliz: <descrição>
    - <Condição de erro 1>: <comportamento esperado>
    - <Condição de borda>: <comportamento esperado>
- **Mocks necessários:** <lista ou "nenhum — domínio puro">
- **Rastreabilidade:** <REQ-N> · <NFR-N>
```

**Checklist de qualidade:**

- [ ] Um UT por método de domínio identificado no `design.md`
- [ ] Cada UT cobre ao menos: caminho feliz + cada condição de erro do método
- [ ] Nenhum UT depende de banco, HTTP ou serviço externo
- [ ] Mocks estão declarados quando necessário
- [ ] Cada UT rastreia ao menos um REQ

---

### 2. Testes de Integração

**Propósito:** Verificar que componentes de infraestrutura funcionam corretamente com suas dependências reais.

**Formato:**

```markdown
### IT-<N>: <NomeDoComponente> — <método ou comportamento>

- **O que testa:** <comportamento com dependência real>
- **Dependências reais usadas:** <banco de teste | Redis de teste | serviço externo mockado>
- **Casos cobertos:**
    - <Caso 1>: <comportamento esperado>
    - <Caso 2>: <comportamento esperado>
- **Setup necessário:** <estado inicial do banco/Redis para o teste>
- **Rastreabilidade:** <REQ-N> · <NFR-N>
```

**Checklist de qualidade:**

- [ ] Um IT por repository (cobrindo seus métodos principais)
- [ ] Um IT por adapter de serviço externo
- [ ] Cada IT especifica quais dependências são reais e quais são mockadas
- [ ] Setup/teardown do estado externo está descrito
- [ ] Comportamentos de falha de dependência estão cobertos (ex: Redis indisponível)

---

### 3. Testes E2E Gherkin

**Propósito:** Executar os cenários BDD como testes automatizados end-to-end via step definitions.

## Regras Normativas para Derivação de Tasks

As regras abaixo devem ser seguidas pelo `tasks-agent` ao gerar `tasks.md`.

### Regra 1 — Rastreabilidade obrigatória

Todo Scenario definido em `scenarios.feature` deve resultar em pelo menos
um teste automatizado especificado neste documento.

Nenhum Scenario pode existir sem um GH correspondente.

### Regra 2 — Derivação obrigatória de tasks

Cada item GH-\* definido nesta estratégia deve gerar ao menos uma task
de implementação no `tasks.md`.

Essa task deve:

- implementar as step definitions necessárias
- executar o Scenario como teste automatizado
- validar os resultados definidos nos steps `Then`

### Regra 3 — Independência de ferramenta

O `test-strategy.md` não define ferramentas específicas.

A escolha da ferramenta de execução (framework de testes, runner,
biblioteca BDD, etc.) deve ser decidida pelo projeto ou pela arquitetura
definida no `design.md`.

Este documento especifica apenas:

- comportamento testado
- rastreabilidade
- requisitos de execução do teste

### Regra 4 — Cobertura mínima

Cobertura mínima obrigatória:

- 100% dos Scenarios devem possuir um GH correspondente
- Cada GH deve ser automatizável
- O `tasks-agent` deve gerar tasks suficientes para implementar
  todos os GH definidos neste documento

**Formato:**

```markdown
### GH-<N>: Scenario "<nome exato do Scenario>"

- **Arquivo:** `docs/features/<slug>/scenarios.feature`
- **Step definitions necessários:**
    - `Given <texto exato do step>` → <o que o step deve fazer>
    - `When <texto exato do step>` → <o que o step deve fazer>
    - `Then <texto exato do step>` → <o que o step deve verificar>
- **Steps reutilizáveis de outros Scenarios:** <lista ou "nenhum">
- **Estado inicial necessário:** <dados no banco, mocks ativos>
- **Rastreabilidade:** <REQ-N> · <NFR-N>
```

**Checklist de qualidade:**

- [ ] Um GH por Scenario do arquivo `.feature` — sem exceções
- [ ] Cada GH é explicitamente automatizável
- [ ] Cada GH deverá gerar ao menos uma task de implementação no tasks.md
- [ ] Cada step definition está descrito com sua implementação esperada
- [ ] Steps reutilizáveis entre Scenarios estão identificados (evitar duplicação)
- [ ] Estado inicial necessário para cada cenário está descrito
- [ ] Cenários que exigem manipulação de estado externo (ex: forçar expiração de token) têm o mecanismo descrito

---

### 4. Testes de Performance

**Propósito:** Verificar que os NFRs mensuráveis de performance são atendidos.

**Formato:**

```markdown
### PT-<N>: <Título descritivo>

- **O que mede:** <métrica: latência p95, tempo de operação, throughput>
- **Threshold:** <valor do NFR, ex: ≤ 30s, ≥ 100ms, ≤ 200ms p95>
- **Método de medição:** <benchmark local | teste de carga | medição em CI>
- **Número de execuções:** <ex: 10 execuções, 100 rps por 60s>
- **Rastreabilidade:** <NFR-N>
```

**Checklist de qualidade:**

- [ ] Um PT por NFR com critério mensurável
- [ ] Threshold derivado diretamente do NFR (não inventado)
- [ ] Método de medição é executável em CI
- [ ] Número de execuções é suficiente para resultado estatisticamente significativo

---

### 5. Testes de Segurança

**Propósito:** Verificar que os mecanismos de segurança funcionam conforme especificado nos NFRs e riscos do PRD.

**Formato:**

```markdown
### ST-<N>: <Título descritivo do ataque ou vulnerabilidade>

- **O que verifica:** <comportamento de segurança esperado>
- **Vetor de ataque simulado:** <ex: enumeração de contas, brute force, replay de token>
- **Casos cobertos:**
    - <Caso 1>: <comportamento esperado do sistema>
    - <Caso 2>: <comportamento esperado do sistema>
- **Rastreabilidade:** <NFR-N> · <Risco do PRD>
```

**Checklist de qualidade:**

- [ ] Um ST por NFR de segurança
- [ ] Um ST por risco do PRD que tem mitigação técnica verificável
- [ ] Cada ST descreve o vetor de ataque simulado (não apenas "testar segurança")
- [ ] O comportamento esperado é específico (status HTTP, mensagem, ausência de dado sensível)

---

### Resumo de Cobertura

**Propósito:** Tabela cruzando cada REQ e NFR com os testes que os cobrem.

**Formato:**

```markdown
## Resumo de Cobertura

| Requisito | Unitário | Integração | E2E Gherkin | Performance | Segurança |
| --------- | -------- | ---------- | ----------- | ----------- | --------- |
| REQ-1     | UT-1     | IT-1, IT-2 | GH-1        | PT-1        | —         |
| REQ-2     | UT-2     | IT-3       | GH-4        | —           | —         |
| NFR-1     | —        | —          | —           | PT-1        | —         |
| NFR-4     | —        | —          | GH-7        | —           | ST-1      |
```

**Checklist de qualidade:**

- [ ] Cada REQ tem ao menos 1 teste E2E Gherkin E ao menos 1 teste unitário ou de integração
- [ ] Cada NFR mensurável tem ao menos 1 teste de performance
- [ ] Cada NFR de segurança tem ao menos 1 teste de segurança
- [ ] Nenhuma linha da tabela está completamente vazia

---

## Cobertura mínima obrigatória

- [ ] Cada método de domínio do `design.md` tem ao menos 1 UT
- [ ] Cada repository do `design.md` tem ao menos 1 IT
- [ ] Cada adapter de serviço externo do `design.md` tem ao menos 1 IT
- [ ] Cada Scenario do `.feature` tem 1 GH correspondente
- [ ] Cada NFR com valor mensurável tem 1 PT
- [ ] Cada NFR de segurança e cada risco mitigável do PRD tem 1 ST

---

## Regras gerais de formato

- **IDs por tipo:** UT-N, IT-N, GH-N, PT-N, ST-N — sequenciais dentro de cada tipo
- **Rastreabilidade sempre presente:** todo teste aponta ao REQ, NFR ou Scenario que originou
- **Sem código:** o `test-strategy.md` descreve o que testar, não como implementar
- **Separadores:** `---` entre seções de tipo
- **Idioma:** português para títulos e descrições; nomes de componentes e métodos em inglês

---

## Referências

- Formato do artefato (customizável): `docs/sdd/test-strategy-format.md`
- Exemplo canônico (customizável): `docs/sdd/test-strategy-example.md`
- Guia de entrevista: `references/interview-guide.md`
