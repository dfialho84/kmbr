---
name: views-standards
description: >
    Padrões de qualidade para documentação de telas/views extraídas de cenários BDD.
    Define a estrutura obrigatória do tela.md (5 seções), critérios de qualidade
    por seção, como derivar componentes e estados dos artefatos Gherkin e PRD,
    formato esperado e regras gerais. Use junto com o interview-guide para conduzir
    a extração e o tela-example como régua de qualidade.
---

# Padrões de Documentação de Telas (Views)

## Especificação de formato

> Se `docs/sdd/views-format.md` existir no projeto, leia-o e use-o como especificação de formato — ele substitui o formato padrão abaixo e pode ter sido customizado para este projeto.

## Formato padrão

### Estrutura obrigatória do `tela.md`

Cada arquivo segue exatamente estas **5 seções**, nesta ordem:

```markdown
# <Nome de Exibição da Tela>

## Visão Geral

## Componentes

## Estados

## Considerações

## Referências Visuais
```

---

## Seção 1 — Visão Geral

**Propósito:** Identificar a tela de forma inequívoca e situar seu objetivo no fluxo da feature.

**Campos obrigatórios:**

| Campo | Descrição |
|---|---|
| **Nome** | Nome de exibição da tela, em português, como aparece nos cenários ou PRD |
| **Slug** | Identificador canônico em kebab-case, sem acentos (ex: `pagina-de-cadastro`) |
| **URL** | Caminho da rota (ex: `/register`). Use `—` se não determinada pelos artefatos |
| **Objetivo** | 1–2 frases orientadas ao usuário: o que o usuário faz/consegue nessa tela |
| **Scenarios relacionados** | Lista dos títulos **exatos** do `.feature` que envolvem esta tela |

**Checklist de qualidade:**
- [ ] O nome é consistente com o que aparece nos Scenarios e no PRD
- [ ] O objetivo é orientado ao usuário — não descreve implementação
- [ ] Todos os Scenarios que mencionam esta tela estão listados
- [ ] A URL é derivada de trecho explícito nos artefatos (ou marcada como `—`)

---

## Seção 2 — Componentes

**Propósito:** Descrever todos os elementos visuais e interativos da tela.

**Subseções obrigatórias (inclua apenas as que se aplicam):**

### Campos de formulário

Tabela com os campos de entrada identificados nos Scenarios:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| Nome do campo | text / email / password / date / file / etc. | Sim / Não | O que o usuário informa ou seleciona |

### Botões

Tabela com os botões e controles de ação:

| Rótulo | Tipo | Comportamento |
|---|---|---|
| Texto do botão como aparece na UI | submit / button / link-button | O que acontece ao clicar |

### Links de navegação

Tabela com links que levam a outras telas:

| Rótulo | Destino | Contexto |
|---|---|---|
| Texto do link | URL ou nome da tela destino | Quando/onde aparece |

### Conteúdo e mensagens fixas

Textos estáticos relevantes para o usuário (títulos, subtítulos, instruções):

- `<texto exato ou descrição do conteúdo>`

**Checklist de qualidade:**
- [ ] Todos os campos mencionados nos Scenarios estão na tabela (ex: `Then o sistema exibe um formulário com os campos nome, email, ...`)
- [ ] Rótulos dos botões como aparecem na UI, não nomes técnicos
- [ ] Comportamento dos botões derivado dos `When` e `Then` dos Scenarios
- [ ] Links de navegação derivados dos `Then ... é levado para` dos Scenarios
- [ ] Sem nomes de componentes de biblioteca (não use `Input`, `Button`, `Link` — use "campo de texto", "botão de envio", "link")
- [ ] Sem código fonte ou props de componentes

---

## Seção 3 — Estados

**Propósito:** Descrever como a tela se comporta em cada situação observável.

**Formato:** Inclua um diagrama `stateDiagram-v2` representando todas as transições da máquina de estados da tela antes de descrever cada estado individualmente.

**Estados a documentar (inclua apenas os que se aplicam):**

### Padrão (initial)
Descrição do que o usuário vê ao acessar a tela pela primeira vez. Campos pré-preenchidos, foco inicial, mensagens de boas-vindas.

### Carregamento (loading)
O que o usuário vê enquanto aguarda resposta do sistema. Aplicável quando há operação assíncrona (envio de formulário, consulta, upload).

### Erro
**Mensagens de erro literais** copiadas dos `Then` dos Scenarios, organizadas por causa:

| Causa | Mensagem exibida |
|---|---|
| Descrição da condição de erro | `"Mensagem exata como escrita no .feature"` |

### Sucesso
O que o usuário vê ou recebe após a ação bem-sucedida. Derivado dos `Then` do happy path.

### Vazio (se aplicável)
Estado quando não há dados a exibir (listas, histórico, resultados de busca).

**Checklist de qualidade:**
- [ ] Inclui diagrama `stateDiagram-v2` com todos os estados e as transições entre eles
- [ ] Estado de Erro tem mensagens literais dos `Then` — não paráfrases
- [ ] Estado de Sucesso descreve o que o usuário vê/recebe (redirecionamento, mensagem, etc.)
- [ ] Estado de Carregamento descrito quando há operação assíncrona nos Scenarios
- [ ] Estado Padrão descreve o que o usuário vê ao acessar pela primeira vez

---

## Seção 4 — Considerações

**Propósito:** Registrar regras de validação, acessibilidade, responsividade e outros aspectos de UX derivados dos artefatos.

**Subseções sugeridas:**

### Validações
Regras de validação de formulário derivadas dos Scenarios de erro e dos requisitos:
- `<campo>`: `<regra de validação>`

### Acessibilidade
Aspectos de acessibilidade identificados ou inferidos do contexto (ex: labels, foco, leitores de tela).

### Responsividade
Comportamento esperado em diferentes tamanhos de tela, se mencionado no PRD ou requirements.

### Outros
Considerações específicas da tela não cobertas acima.

**Checklist de qualidade:**
- [ ] Validações derivadas dos Scenario Outline / Examples e dos requirements
- [ ] Sem suposições não rastreáveis a um artefato
- [ ] Acessibilidade mencionada apenas se há âncora nos artefatos

---

## Seção 5 — Referências Visuais

**Propósito:** Reservar espaço para wireframes, mockups e protótipos a serem preenchidos manualmente pela equipe.

**Esta seção é SEMPRE deixada vazia pelo agente**, com exatamente estes 3 placeholders:

```markdown
## Referências Visuais

### Wireframe
_A preencher manualmente._

### Mockup
_A preencher manualmente._

### Protótipo interativo
_A preencher manualmente._
```

**Regra absoluta:** O agente `extract-views-agent` **nunca** preenche esta seção com conteúdo.

---

## Regras gerais de formato

| Regra | Valor |
|---|---|
| **Arquivo de saída** | `docs/features/<slug>/views/<nome-canonico>/tela.md` |
| **Idioma** | Português. Termos técnicos consagrados ficam em inglês (token, cookie, upload, etc.) |
| **Rastreabilidade** | Todo conteúdo rastreável a Scenario BDD, PRD ou Stories |
| **Sem código fonte** | Nenhum trecho de código, JSX, props ou nomes de componentes de biblioteca |
| **Rótulos** | Como aparecem nos cenários e no PRD — nunca inventados |
| **Mensagens de erro** | Cópias literais dos `Then` do `.feature` |
| **Separador de nome** | Kebab-case sem acentos para slugs e nomes de pasta |

---

## Referências

- Formato do artefato (customizável): `docs/sdd/views-format.md`
- Exemplo canônico (customizável): `docs/sdd/views-example.md`
- Guia de entrevista e banco de perguntas: `references/interview-guide.md`
