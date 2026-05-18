---
name: nf-reqs-standards
description: >
    Padrões de qualidade para criação de requisitos não funcionais neste projeto.
    Define as categorias de RNFs, critérios de qualidade (mensurável, testável,
    específico), como derivar RNFs do PRD, User Stories, cenários BDD e requisitos
    funcionais, formato esperado e regras gerais. Use junto com o interview-guide
    para conduzir a entrevista e o nf-reqs-example como régua de qualidade.
---

# Padrões de Requisitos Não Funcionais

## Especificação de formato

> Se `docs/sdd/nf-reqs-format.md` existir no projeto, leia-o e use-o como especificação de formato — ele substitui o formato padrão abaixo e pode ter sido customizado para este projeto.

## Formato padrão

### O que é um requisito não funcional

Um requisito não funcional (RNF) descreve **como o sistema deve se comportar em termos de qualidade**.

Ele não define _o que o sistema faz_, mas **com que qualidade** deve operar:
- desempenho
- escalabilidade
- disponibilidade
- segurança
- observabilidade
- usabilidade

---

## Características de bons RNFs

RNFs devem ser:

- **Mensuráveis**: expressos com métricas objetivas (ex.: "< 2s", "99,9% uptime")
- **Testáveis**: possível validar com um teste objetivo
- **Específicos**: vinculados a um contexto ou operação clara
- **Rastreáveis**: derivados de uma fonte (PRD, Story, BDD, requisito funcional)

Evite:
- Termos vagos: "rápido", "seguro", "alta disponibilidade", "boa performance"

Prefira:
- Métricas claras: "em até 2 segundos", "para 95% das requisições", "com taxa de erro < 1%"

---

## Categorias de RNFs

### Performance

Tempo de resposta e throughput de operações do sistema.

Perguntas-chave:
- Qual o tempo máximo de resposta para esta operação?
- Em qual percentil? (95%? 99%?)
- Em condições de carga normal ou de pico?

---

### Escalabilidade

Capacidade de suportar crescimento de usuários ou volume.

Perguntas-chave:
- Quantos usuários simultâneos o sistema deve suportar?
- Qual o crescimento esperado de volume?
- O sistema precisa escalar horizontalmente?

---

### Disponibilidade

Uptime e tolerância a falhas.

Perguntas-chave:
- Qual o uptime mínimo esperado? (99%? 99,9%? 99,99%?)
- Qual o tempo máximo de indisponibilidade por mês?
- O sistema precisa de failover automático?

---

### Segurança

Autenticação, autorização, criptografia e proteção de dados.

Perguntas-chave:
- Quais dados precisam ser criptografados?
- Qual a política de tentativas falhas (bloqueio, rate limit)?
- Quais eventos de segurança precisam ser auditados?

---

### Observabilidade

Logs, métricas e rastreamento.

Perguntas-chave:
- Quais eventos devem ser registrados em log?
- Quais métricas devem ser monitoradas?
- Qual o tempo mínimo de retenção de logs?

---

### Usabilidade

Tempo de aprendizado e acessibilidade.

Perguntas-chave:
- Existe requisito de tempo máximo para completar uma tarefa?
- Há requisitos de acessibilidade (WCAG)?
- Existe suporte a múltiplos idiomas?

---

## Estrutura obrigatória do arquivo `nf-requirements.md`

```markdown
# Requisitos Não Funcionais — <Nome da Feature>

## Performance

**NFR-1**: Em condições normais, o sistema deve <comportamento> em até <métrica> para <condição>.

> Fonte: <âncora nos artefatos>

## Segurança

**NFR-2**: O sistema deve <comportamento>.

> Fonte: <âncora nos artefatos>
```

---

## Formato de cada RNF

```
[Condição opcional,] o sistema deve [comportamento] [métrica].
```

Exemplos bem escritos:
- `Em condições normais, o sistema deve responder requisições de autenticação em até 2 segundos para 95% dos casos.`
- `O sistema deve suportar até 5.000 usuários simultâneos sem degradação perceptível.`
- `O sistema deve ter disponibilidade mínima de 99,9% ao mês.`
- `O sistema deve registrar em log todas as tentativas de autenticação, incluindo as falhas.`
- `O sistema deve bloquear temporariamente contas após 5 tentativas de login malsucedidas consecutivas.`

---

## Critérios de qualidade por RNF

### Mensurabilidade

**Checklist:**
- [ ] O RNF contém uma métrica objetiva (número, percentagem, tempo, quantidade)
- [ ] A métrica é verificável sem ambiguidade
- [ ] A condição de medição está especificada (carga normal? pico? percentil?)

---

### Testabilidade

**Checklist:**
- [ ] É possível escrever um teste que prove que o RNF foi atendido ou violado
- [ ] O RNF não usa termos vagos: "rápido", "seguro", "performático", "alto"
- [ ] O comportamento descrito é observável externamente

---

### Rastreabilidade

**Checklist:**
- [ ] O campo `> Fonte:` identifica de onde o RNF foi derivado (PRD, Story, BDD ou requisito funcional)
- [ ] O RNF está vinculado a uma categoria coerente

---

## Critério de qualidade do conjunto de RNFs

| Critério | Verificação |
|---|---|
| **Cobertura por categoria** | As categorias relevantes para a feature estão cobertas |
| **Mensurabilidade** | Todo RNF tem métrica objetiva |
| **Consistência** | O vocabulário é uniforme com o PRD e os requisitos funcionais |
| **Não-redundância** | Dois RNFs não descrevem a mesma restrição de qualidade |
| **Relevância** | Nenhum RNF é genérico demais ou desconectado da feature |

---

## Como derivar RNFs dos artefatos

### Do PRD

| Sinal no PRD | Categoria de RNF resultante |
|---|---|
| "crescimento rápido de usuários" | Escalabilidade |
| "sistema deve estar sempre disponível" | Disponibilidade |
| "dados sensíveis", "senha", "token" | Segurança |
| "tempo real", "imediatamente", "sem delay" | Performance |
| "rastrear", "auditar", "registrar" | Observabilidade |
| "fácil de usar", "acessível" | Usabilidade |

### Das User Stories

- Critérios de aceitação com palavras como "rapidamente", "sem espera" → Performance
- Critérios com "seguro", "protegido", "autenticado" → Segurança
- Critérios com "registrar", "notificar", "alertar" → Observabilidade

### Dos cenários BDD

- `Given N usuários simultâneos` → Escalabilidade / Performance
- `When a request is made` + expectativa de tempo → Performance
- Cenários de falha com retry ou bloqueio → Segurança

### Dos requisitos funcionais (EARS)

Para cada requisito funcional, pergunte:
- Quão rápido deve executar? → Performance
- Quantos usuários ao mesmo tempo? → Escalabilidade
- O que acontece se falhar? → Disponibilidade
- Quais dados precisam ser protegidos? → Segurança
- O que precisa ser logado? → Observabilidade

---

## Regras gerais de formato

- **Arquivo de saída:** `docs/features/<slug>/nf-requirements.md`
- **Idioma dos RNFs:** português
- **Numeração:** sequencial global — NFR-1, NFR-2, NFR-3... (não reinicia por categoria)
- **Agrupamento:** use cabeçalhos `##` por categoria
- **Separação:** linha em branco entre RNFs

---

## Referências

- Formato do artefato (customizável): `docs/sdd/nf-reqs-format.md`
- Exemplo canônico (customizável): `docs/sdd/nf-reqs-example.md`
- Guia de entrevista e banco de perguntas: `references/interview-guide.md`
