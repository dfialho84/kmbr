---
name: design-standards
description: >
    Padrões de qualidade para criação de documentos de design técnico neste
    projeto. Define as 6 seções obrigatórias, critérios de qualidade por seção,
    como derivar decisões a partir de todos os artefatos SDD anteriores (PRD,
    Stories, BDD Scenarios, Requirements, NF-Requirements), formato esperado
    e regras gerais. Use junto com o interview-guide para conduzir a entrevista
    e o design-example como régua de qualidade.
---

# Padrões de Design Técnico

## Especificação de formato

> Se `docs/sdd/design-format.md` existir no projeto, leia-o e use-o como especificação de formato — ele substitui o formato padrão abaixo e pode ter sido customizado para este projeto.

## Formato padrão

### Estrutura obrigatória (6 seções, nesta ordem)

1. Visão Geral Técnica
2. Arquitetura de Componentes
3. Modelo de Dados
4. API / Contratos
5. Fluxo de Execução
6. Decisões Técnicas

**Fontes de entrada por artefato:**

| Artefato | Papel no design |
|----------|----------------|
| `requirements.md` | O que o sistema **deve** fazer |
| `nf-requirements.md` | Restrições de performance, segurança, observabilidade |
| `scenarios.feature` | Esqueleto dos fluxos de execução e contratos de API |
| `stories.md` | Critérios de aceitação e validações de entrada |
| `prd.md` | Dependências externas, riscos, fora de escopo |
| `docs/constitution.md` | Restrições arquiteturais não negociáveis |

---

## Checklists por seção

### 1. Visão Geral Técnica
_Formato: texto corrido, 2-4 frases._
- [ ] Descreve a abordagem técnica principal (não o que a feature faz ao usuário)
- [ ] Menciona tecnologias-chave (ex: OTP, bcrypt, Redis, serviço de email)
- [ ] Referencia camada arquitetural ou padrão (ex: hexagonal)
- [ ] Consistente com as restrições da `docs/constitution.md`

### 2. Arquitetura de Componentes
_Formato: diagrama `flowchart TD` seguido de um bloco `### NomeComponente` por componente, com camada, responsabilidade e dependências._
- [ ] Inclui diagrama `flowchart TD` mostrando dependências entre todos os componentes (infra → aplicação → domínio)
- [ ] Cada componente tem responsabilidade única e clara
- [ ] Camadas seguem a arquitetura da `docs/constitution.md`
- [ ] Dependências apontam para dentro (infra → aplicação → domínio)
- [ ] Todos os requisitos funcionais são endereçados por ao menos um componente
- [ ] Serviços externos isolados em adapters de infraestrutura
- [ ] Novos componentes sinalizados explicitamente

### 3. Modelo de Dados
_Formato: diagrama `erDiagram` seguido de tabela `Campo | Tipo | Descrição` por entidade, com relações explícitas._
- [ ] Inclui diagrama `erDiagram` mostrando todas as entidades e suas relações
- [ ] Entidades deriváveis dos requisitos ou cenários BDD — nenhuma inventada
- [ ] Campos de expiração e uso único presentes onde NFRs exigem
- [ ] Campos de auditoria declarados se o padrão do projeto exige
- [ ] Sem DDL ou migração (apenas modelo lógico)

### 4. API / Contratos
_Formato: `### MÉTODO /path` com autenticação, request body, response 200 e tabela de erros._
- [ ] Cada endpoint corresponde a ao menos um requisito ou cenário BDD
- [ ] Payloads de entrada com campos e tipos definidos
- [ ] Todos os cenários de erro têm código HTTP correspondente
- [ ] Bloqueios por rate limit (NFRs) têm código 429
- [ ] Autenticação de cada endpoint declarada

### 5. Fluxo de Execução
_Formato: `### Fluxo: <nome do Scenario>`, passos numerados com componente responsável, seguidos de `sequenceDiagram` Mermaid._
- [ ] Um fluxo por Scenario do `.feature`
- [ ] Caminho feliz passo a passo do request até a resposta
- [ ] Cada passo nomeia o componente responsável
- [ ] Cada fluxo inclui `sequenceDiagram` com participantes e mensagens correspondendo aos passos numerados
- [ ] Fluxos alternativos cobrem todos os cenários BDD de erro
- [ ] Nenhum passo vago ("o sistema processa" sem especificar o quê)

### 6. Decisões Técnicas
_Formato: `### DT-N: <título>` com problema, alternativas, decisão, justificativa e requisito relacionado._
- [ ] Apenas decisões com trade-off real (não as óbvias)
- [ ] Ao menos duas alternativas por decisão
- [ ] Justificativa menciona o trade-off
- [ ] Cada decisão rastreada a um REQ ou NFR
- [ ] Nenhuma decisão contradiz a `docs/constitution.md`

---

## Regras de formato

- **Idioma:** português. Nomes de componentes, campos e endpoints ficam em inglês.
- **Rastreabilidade:** sempre referencie REQ-N ou NFR-N que motivou a decisão.
- **Sem código:** sem código fonte; pseudocódigo aceitável apenas em Fluxo de Execução.
- **Sem repetição:** se a informação está no PRD ou nos requisitos, referencie — não copie.
- **Separadores:** usar `---` entre seções.

---

## Referências

- Formato do artefato (customizável): `docs/sdd/design-format.md`
- Exemplo canônico (customizável): `docs/sdd/design-example.md`
- Banco de perguntas: `references/interview-guide.md`
