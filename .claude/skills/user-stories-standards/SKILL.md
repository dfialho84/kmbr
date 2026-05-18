---
name: user-stories-standards
description: >
    Padrões de qualidade para criação de estórias de usuário neste projeto.
    Define a estrutura obrigatória de cada estória, critérios de qualidade
    baseados no modelo INVEST adaptado, formato esperado e regras gerais.
    Use junto com o interview-guide para conduzir a entrevista e o
    stories-example como régua de qualidade.
---

# Padrões de Estórias de Usuário

## Especificação de formato

> Se `docs/sdd/user-stories-format.md` existir no projeto, leia-o e use-o como especificação de formato — ele substitui o formato padrão abaixo e pode ter sido customizado para este projeto.

## Formato padrão

### Estrutura obrigatória de cada estória

Cada estória segue este formato, sem exceções:

```markdown
## Estoria <N> – <Título>

Como <persona>
Eu quero <ação ou capacidade>
Para que <benefício ou resultado>

_Critérios de aceitação_:

- <critério 1>
- <critério 2>
- <critério N>
```

---

## Critérios de qualidade por parte da estória

### Cabeçalho (`Como / Eu quero / Para que`)

**Propósito:** Expressar a necessidade do usuário do ponto de vista de quem usa, não de quem constrói.

**Checklist de qualidade:**
- [ ] **Como** — é uma persona específica, não genérica ("entregador com conta criada", não "o usuário" ou "alguém")
- [ ] **Como** — a persona é consistente com a seção Usuário-Alvo do PRD da feature
- [ ] **Eu quero** — expressa uma capacidade ou ação do usuário, não um detalhe técnico de implementação
- [ ] **Eu quero** — usa linguagem de negócio ("permanecer autenticado"), não técnica ("receber refresh token")
- [ ] **Para que** — expressa um benefício real ou resultado concreto para o usuário
- [ ] **Para que** — não é trivialmente óbvio (evitar "Para que eu possa usar o sistema")
- [ ] O trio "Como / Eu quero / Para que" forma uma frase coerente quando lida em sequência

**Sinal de qualidade suficiente:** Qualquer pessoa do time entende quem precisa de quê e por quê sem ler os critérios.

---

### Critérios de aceitação

**Propósito:** Definir, de forma verificável, o que o sistema deve fazer para que a estória seja considerada concluída.

**Formato:** Lista de bullets. Cada item começa com "O sistema deve..." ou "O sistema não deve...".

**Checklist de qualidade:**
- [ ] Entre 2 e 6 critérios por estória
- [ ] Cada critério é verificável — dá para dizer "passou" ou "falhou" em um teste
- [ ] Cobre o caminho feliz (o que acontece quando tudo dá certo)
- [ ] Cobre pelo menos um cenário de validação ou erro relevante para esta estória
- [ ] Nenhum critério repete literalmente o "Eu quero" da estória
- [ ] Nenhum critério menciona detalhes de implementação (nome de função, estrutura de banco, biblioteca)
- [ ] Os critérios são coerentes com o PRD — não contradizem objetivos, fluxos ou fora do escopo

**Sinal de qualidade suficiente:** Um desenvolvedor consegue escrever um teste automatizado a partir de cada critério, sem precisar perguntar nada.

---

## Critério de qualidade do conjunto de estórias (INVEST adaptado)

Avalie o conjunto completo contra cada letra do INVEST:

| Letra | Princípio | Verificação |
|---|---|---|
| **I** | Independente | Cada estória pode ser implementada sem depender da sequência das outras (exceto pré-condições explícitas do PRD) |
| **N** | Negociável | O "como" e "para que" foram validados com o usuário — não foram inventados pelo agente |
| **V** | Valiosa | Cada estória entrega valor perceptível ao usuário final, não é apenas infraestrutura técnica |
| **E** | Estimável | Um desenvolvedor consegue estimar o esforço de implementação com base nos critérios |
| **S** | Small (pequena) | Cada estória cobre um único fluxo ou responsabilidade; fluxos diferentes são estórias separadas |
| **T** | Testável | Todos os critérios de aceitação são verificáveis por um teste (manual ou automatizado) |

---

## Tipos de estória e quando usar cada um

### Estória de caminho feliz (happy path)
Cobre o fluxo principal do usuário quando tudo ocorre como esperado.
Âncora no PRD: seção **Fluxo Principal** ou itens da seção **Objetivos** com verbo "Permitir".

### Estória de validação
Cobre o comportamento do sistema ao receber dados inválidos ou inesperados.
Âncora no PRD: seção **Objetivos** com verbos "Validar", "Rejeitar" ou "Detectar".

### Estória de caso de falha
Cobre o comportamento do sistema em situações de erro ou exceção visíveis ao usuário.
Âncora no PRD: seção **Fluxos Alternativos**.

### Estória de segurança / restrição
Cobre controle de acesso, proteção de dados ou comportamento em tentativas abusivas.
Âncora no PRD: seção **Riscos** ou **Critérios de Sucesso** quando mencionam segurança com impacto visível ao usuário.

---

## Regras gerais de formato

- **Título da seção:** `## Estoria <N> – <Título>` (com travessão `–`, não hífen `-`)
- **Numeração:** sequencial a partir de 1, sem pular números
- **Tom:** orientado ao usuário, não à implementação. Um PM deve entender todas as estórias sem saber código.
- **Idioma:** português. Termos técnicos consagrados ficam em inglês (JWT, cookie, OAuth, bcrypt).
- **Título do arquivo:** `# Estórias de Usuário — <Nome da Feature>` (com travessão)
- **Separação:** linha em branco entre estórias
- **Critérios:** nunca deixar uma estória sem critérios de aceitação

---

## Referências

- Formato do artefato (customizável): `docs/sdd/user-stories-format.md`
- Exemplo canônico (customizável): `docs/sdd/user-stories-example.md`
- Guia de entrevista e banco de perguntas: `references/interview-guide.md`
