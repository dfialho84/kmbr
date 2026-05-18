---
name: bdd-scenarios-standards
description: >
    Padrões de qualidade para criação de cenários BDD (Gherkin) neste projeto.
    Define a estrutura obrigatória de cada cenário, critérios de qualidade,
    como derivar cenários do PRD e das User Stories, formato esperado e regras
    gerais. Use junto com o interview-guide para conduzir a entrevista e o
    scenarios-example como régua de qualidade.
---

# Padrões de Cenários BDD

## Especificação de formato

> Se `docs/sdd/scenarios-format.md` existir no projeto, leia-o e use-o como especificação de formato — ele substitui o formato padrão abaixo e pode ter sido customizado para este projeto.

## Formato padrão

### Estrutura obrigatória do arquivo `.feature`

Cada arquivo segue este formato:

```gherkin
Feature: <Nome da Feature>
  <Descrição opcional de uma linha explicando o objetivo da feature>

  Scenario: <Título do cenário>
    Given <pré-condição ou estado do sistema>
    When <ação realizada pelo usuário ou evento>
    Then <resultado observável esperado>
    And <resultado adicional, se necessário>

  Scenario: <Outro cenário>
    ...
```

---

## Critérios de qualidade por parte do cenário

### `Feature`

**Propósito:** Identificar a funcionalidade sendo descrita.

**Checklist de qualidade:**
- [ ] O nome da feature é consistente com o PRD e as User Stories
- [ ] A descrição (opcional) é orientada ao negócio, não à implementação

---

### `Scenario`

**Propósito:** Descrever um comportamento observável e verificável do sistema.

**Checklist de qualidade:**
- [ ] O título é descritivo e específico — identifica o que está sendo testado sem ler os passos
- [ ] Cada cenário descreve **um único comportamento** (não mistura happy path com erro no mesmo cenário)
- [ ] O conjunto inclui: 1 cenário de sucesso (happy path), 2–3 cenários de erro, ao menos 1 edge case
- [ ] Cenários de erro têm título no padrão: `<Ação> com <condição de falha>` (ex: "Login com senha incorreta")

---

### `Given`

**Propósito:** Descrever o estado inicial do sistema antes da ação.

**Checklist de qualidade:**
- [ ] Descreve um estado do sistema ou pré-condição, não uma ação do usuário
- [ ] Usa linguagem de domínio, não termos técnicos de implementação
- [ ] Não menciona banco de dados, JWT, bcrypt, tabelas ou bibliotecas
- [ ] Se a pré-condição é óbvia (ex: "sistema está disponível"), pode ser omitida para manter o cenário limpo

---

### `When`

**Propósito:** Descrever a ação que dispara o comportamento descrito no cenário.

**Checklist de qualidade:**
- [ ] Descreve uma única ação do usuário ou evento externo
- [ ] Usa verbos de ação no presente ("o entregador envia", "o sistema recebe")
- [ ] Não menciona implementação (não usa "chama endpoint", "faz POST", "executa query")

---

### `Then`

**Propósito:** Descrever o resultado observável esperado após a ação.

**Checklist de qualidade:**
- [ ] Descreve o resultado do ponto de vista do usuário ou de um observador externo
- [ ] É verificável — dá para dizer "passou" ou "falhou" ao observar o sistema
- [ ] Não menciona estado interno do sistema que não seja observável externamente
- [ ] `And` é usado apenas para resultados adicionais do mesmo cenário, não para novas ações

---

## Critério de qualidade do conjunto de cenários

Um conjunto saudável de cenários para uma feature deve:

| Critério | Verificação |
|---|---|
| **Cobertura** | Cobre happy path, principais erros e ao menos um edge case |
| **Clareza** | Um QA consegue executar os testes apenas lendo os cenários |
| **Independência** | Cada cenário funciona isoladamente, sem depender da ordem de execução |
| **Linguagem de domínio** | Qualquer pessoa do time entende os cenários sem saber código |
| **Rastreabilidade** | Cada cenário tem origem clara no PRD (fluxo principal, alternativo, critério de sucesso) ou nas User Stories |

---

## Tipos de cenário e quando criar cada um

### Cenário de sucesso (happy path)
Cobre o fluxo principal quando tudo ocorre como esperado.
**Âncora:** seção **Fluxo Principal** do PRD ou critérios de aceitação da estória de caminho feliz.

### Cenário de erro de entrada
Cobre o comportamento quando o usuário fornece dados inválidos ou incompletos.
**Âncora:** seção **Objetivos** com verbos "Rejeitar", "Validar" ou critérios de aceitação de estórias de validação.

### Cenário de estado inválido
Cobre o comportamento quando o sistema está em um estado inesperado ou a pré-condição não é satisfeita.
**Âncora:** seção **Fluxos Alternativos** do PRD.

### Cenário de edge case
Cobre situações limite que não são nem o caminho feliz nem um erro comum.
**Âncora:** seção **Riscos** do PRD ou critérios de aceitação de estórias de segurança.

---

## Regras gerais de formato

- **Arquivo de saída:** `docs/features/<slug>/scenarios.feature`
- **Indentação:** 2 espaços para os passos dentro de `Scenario`
- **Idioma dos passos:** português. Termos técnicos consagrados ficam em inglês (token, JWT, cookie, OAuth)
- **Separação:** linha em branco entre cenários
- **Sem comentários inline** nos passos — o passo deve ser autoexplicativo
- **Sem `Background`** a menos que o usuário explicitamente solicite — preferir `Given` explícito em cada cenário para clareza

---

## Referências

- Formato do artefato (customizável): `docs/sdd/scenarios-format.md`
- Exemplo canônico (customizável): `docs/sdd/scenarios-example.feature`
- Guia de entrevista e banco de perguntas: `references/interview-guide.md`
