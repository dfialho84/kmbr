---
name: constitution-standards
description: >
    Padrões de qualidade para criação de constitution.md neste projeto.
    Define as 4 seções obrigatórias, critérios de qualidade por seção,
    formato esperado e regras gerais. Use junto com o interview-guide para
    conduzir a entrevista e o constitution-example como régua de qualidade.
---

# Padrões de Constitution

## O que é a constitution.md

A `constitution.md` é o conjunto de regras técnicas não-negociáveis que governam todas as implementações de um projeto ou sistema. Ela funciona como um contrato entre o time e a codebase: qualquer implementação que viole a constituição é inválida e deve ser corrigida antes do merge.

---

## Especificação de formato

> Se `docs/sdd/constitution-format.md` existir no projeto, leia-o e use-o como especificação de formato — ele substitui o formato padrão abaixo e pode ter sido customizado para este projeto.

## Formato padrão

### Estrutura obrigatória

Uma constitution.md é composta pelas seguintes seções, nesta ordem:

1. Purpose (Propósito)
2. Must Do (Obrigações)
3. Ask Before Proceeding (Pergunte Antes de Prosseguir)
4. Never Do (Proibições)
5. Enforcement (Execução)

---

## Seções e critérios de qualidade

### 1. Purpose

**Propósito:** Declarar em 1-2 frases o que a constituição faz e como deve ser usada.

**Formato:** Texto corrido (sem bullets, sem tabelas).

**Checklist de qualidade:**
- [ ] Declara que o documento define regras não-negociáveis
- [ ] Menciona o escopo (projeto, sistema, feature)
- [ ] Instrui que ambiguidades devem ser resolvidas explicitamente — nunca assumidas
- [ ] Tem no máximo 3 frases

**Sinal de qualidade suficiente:** Qualquer desenvolvedor entende o papel do documento sem precisar ler o restante.

---

### 2. Must Do

**Propósito:** Listar as obrigações técnicas positivas — o que toda implementação deve fazer sem exceção.

**Formato:** Lista numerada. Cada item começa com "All [sujeito] must [verbo]" (ou equivalente em português).

**Checklist de qualidade:**
- [ ] Entre 4 e 8 regras
- [ ] Cada regra cobre um aspecto diferente: camadas, erros, validação, logs, rastreabilidade
- [ ] Cada regra é verificável — dá para dizer "esta implementação segue ou não esta regra"
- [ ] Cada regra usa linguagem imperativa ("must", "deve")
- [ ] Nenhuma regra repete ou sobrepõe outra da mesma seção ou de outra seção

**Cobertura mínima esperada:**
- Separação de camadas (business logic, transport, persistence)
- Propagação de erros com estrutura padronizada
- Validação de entradas no limite do sistema
- Logging de operações críticas
- Rastreabilidade para requisito ou BDD

**Sinal de qualidade suficiente:** Um code reviewer consegue checar mecanicamente cada regra ao revisar um PR.

---

### 3. Ask Before Proceeding

**Propósito:** Definir as situações que bloqueiam o desenvolvimento até que uma decisão explícita seja tomada.

**Formato:** Lista numerada. Cada item começa com "If [condição], [ação]."

**Checklist de qualidade:**
- [ ] Entre 3 e 6 regras
- [ ] Cada regra tem uma condição de disparo clara (se X então perguntar)
- [ ] Cobre ao menos: requisito ambíguo, decisão arquitetural com múltiplas opções, mudança de contrato/API, conflito com a própria constituição
- [ ] Cada ação instrui explicitamente a parar e pedir clareza — não continuar com suposições
- [ ] Nenhuma regra é vaga demais para ser acionada (ex: "se houver dúvida" não serve)

**Sinal de qualidade suficiente:** Um desenvolvedor consegue identificar sem ambiguidade se está ou não numa situação que requer parada.

---

### 4. Never Do

**Propósito:** Listar as proibições absolutas — o que nenhuma implementação jamais pode fazer.

**Formato:** Lista numerada. Cada item começa com "Never [verbo]" (ou equivalente em português).

**Checklist de qualidade:**
- [ ] Entre 4 e 8 regras
- [ ] Cada regra é uma proibição absoluta, sem exceções
- [ ] Cobre ao menos: acesso direto a dados em camadas erradas, lógica de negócio fora do domínio, erros silenciosos, acoplamento com frameworks, suposições de requisitos
- [ ] Nenhuma regra se contradiz com uma regra do Must Do
- [ ] Cada regra descreve um anti-pattern concreto, não uma generalização

**Sinal de qualidade suficiente:** Qualquer desenvolvedor reconhece imediatamente quando uma implementação viola uma das regras.

---

### 5. Enforcement

**Propósito:** Definir as consequências práticas para quem viola a constituição e o mecanismo de aplicação.

**Formato:** Lista numerada. Cada item descreve uma consequência ou gate de validação.

**Checklist de qualidade:**
- [ ] Entre 2 e 4 regras
- [ ] Ao menos uma regra exige que planos de implementação descrevam conformidade com a constituição
- [ ] Ao menos uma regra especifica que violações invalidam a implementação e devem ser corrigidas antes do merge
- [ ] Ao menos uma regra bloqueia implementação quando há clareza faltando
- [ ] As consequências são concretas (invalidar, bloquear, exigir correção) — não vagas (recomendar, sugerir)

**Sinal de qualidade suficiente:** A seção funciona como um checklist pré-merge verificável.

---

## Regras gerais de formato

- **Idioma:** português por padrão. Termos técnicos (controller, repository, adapter, middleware) ficam em inglês.
- **Numeração global:** as regras são numeradas sequencialmente ao longo de todo o documento (1, 2, 3...) — não reinicia por seção.
- **Sem seções vazias:** se uma seção não for aplicável, registrar explicitamente por quê.
- **Sem repetição:** se uma regra já foi dita em uma seção, não repita em outra.
- **Tom:** objetivo e direto. Sem justificativas longas — a regra deve ser autoexplicativa.
- **Separadores:** usar `---` entre seções para facilitar leitura.

---

## Referências

- Formato do artefato (customizável): `docs/sdd/constitution-format.md`
- Exemplo canônico (customizável): `docs/sdd/constitution-example.md`
- Guia de entrevista e banco de perguntas: `references/interview-guide.md`
