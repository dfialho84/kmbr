---
name: design-system-standards
description: >
    Padrões de qualidade para criação dos arquivos do design system em
    docs/design-system/. Define a estrutura obrigatória de cada arquivo
    (colors.md, typography.md, spacing.md, components.md, themes.md),
    critérios de qualidade por arquivo, como extrair decisões de
    configurações existentes (qualquer stack: Tailwind, CSS Modules,
    Styled Components, etc.) e regras gerais. Use junto com
    interview-guide e design-system-example.
---

# Padrões de Design System

## O que é o design system

O design system define as **decisões visuais globais** do projeto — as regras
que garantem identidade visual coesa independentemente de qual feature está
sendo implementada ou quem está implementando.

É o equivalente visual da `constitution.md`: assim como a constituição garante
que todo componente de domínio siga as mesmas regras arquiteturais, o design
system garante que todo botão primário seja igual em todas as telas.

---

## Posição no projeto

```
docs/
  constitution.md          ← regras arquiteturais globais
  design-system/
    colors.md              ← paleta e uso semântico de cores
    typography.md          ← escala tipográfica e uso
    spacing.md             ← tokens de espaçamento
    components.md          ← especificação de componentes base e compostos
    themes.md              ← temas (light/dark) e variáveis CSS
  features/
    <slug>/
      ui-spec.md           ← usa o design system, especifica o específico da feature
```

---

## Especificação de formato

> Se `docs/sdd/design-system-format.md` existir no projeto, leia-o e use-o como especificação de formato — ele substitui o formato padrão abaixo e pode ter sido customizado para este projeto.

## Formato padrão

### Ordem de criação obrigatória

```
colors.md → typography.md → spacing.md → components.md → themes.md
```

Cada arquivo referencia os anteriores. Criar fora de ordem gera inconsistências.

---

## Estrutura e critérios por arquivo

### colors.md

**Propósito:** Definir a paleta completa com nomes semânticos e regras de uso.

**Estrutura obrigatória:**
```markdown
# Cores

## Paleta Semântica
Cores com significado funcional — usadas via classes Tailwind ou variáveis CSS.

| Token | Valor | Classe Tailwind | Uso |
|-------|-------|----------------|-----|
| primary | #... / hsl(...) | `bg-primary` / `text-primary` | Ações principais, CTAs |
| primary-foreground | ... | `text-primary-foreground` | Texto sobre fundo primary |
| secondary | ... | `bg-secondary` | Ações secundárias |
| destructive | ... | `bg-destructive` | Ações destrutivas, erros |
| muted | ... | `bg-muted` | Fundos sutis, desabilitados |
| accent | ... | `bg-accent` | Destaques, hover states |
| background | ... | `bg-background` | Fundo principal da página |
| foreground | ... | `text-foreground` | Texto principal |
| border | ... | `border-border` | Bordas de componentes |
| ring | ... | `ring` | Foco visível (acessibilidade) |

## Paleta de Suporte
Cores adicionais do projeto (se houver) — status, categorias, etc.

## Regras de Uso
- Nunca usar valores hex diretamente no código — sempre via token semântico
- <regra específica do projeto>

## Acessibilidade
- primary sobre background: contraste <N>:1 (mínimo WCAG AA: 4.5:1 para texto normal)
- destructive sobre background: contraste <N>:1
```

**Checklist de qualidade:**
- [ ] Tokens semânticos cobrem pelo menos: ação principal, ação destrutiva, fundo, texto principal e borda
- [ ] Cada token tem valor, referência de uso (classe, variável CSS ou prop) e descrição de uso
- [ ] Contraste mínimo WCAG AA declarado para combinações primárias
- [ ] Regra explícita de não usar valores de cor diretamente no código — sempre via token semântico
- [ ] Paleta é derivada das configurações encontradas no projeto — não inventada

---

### typography.md

**Propósito:** Definir escala tipográfica, famílias de fonte e regras de uso.

**Estrutura obrigatória:**
```markdown
# Tipografia

## Famílias de Fonte
| Família | Variável CSS / Classe | Uso |
|---------|----------------------|-----|
| <nome> | `font-sans` / `var(--font-sans)` | Texto geral |
| <nome> | `font-mono` | Código, dados técnicos |

## Escala Tipográfica
| Nível | Classe Tailwind | Tamanho | Peso | Line Height | Uso |
|-------|----------------|---------|------|-------------|-----|
| Display | `text-4xl font-bold` | 36px | 700 | 1.2 | Títulos de página hero |
| H1 | `text-3xl font-bold` | 30px | 700 | 1.25 | Título principal de página |
| H2 | `text-2xl font-semibold` | 24px | 600 | 1.3 | Seções principais |
| H3 | `text-xl font-semibold` | 20px | 600 | 1.4 | Subseções |
| Body | `text-base` | 16px | 400 | 1.5 | Texto corrido |
| Small | `text-sm` | 14px | 400 | 1.5 | Labels, metadados |
| Caption | `text-xs` | 12px | 400 | 1.4 | Legendas, tooltips |

## Regras de Uso
- <quando usar cada nível>
- Nunca usar tamanhos arbitrários fora da escala
```

**Checklist de qualidade:**
- [ ] Ao menos uma família de fonte declarada com referência de uso (classe, variável CSS ou prop)
- [ ] Escala com ao menos 5 níveis cobrindo do título ao caption
- [ ] Cada nível tem referência de uso, tamanho em px, peso e uso claro
- [ ] Derivado das configurações encontradas no projeto quando há fontes customizadas

---

### spacing.md

**Propósito:** Definir a escala de espaçamento e como aplicá-la.

**Estrutura obrigatória:**
```markdown
# Espaçamento

## Escala Base
O projeto usa <descrever a escala — ex: escala padrão do Tailwind base 4px, escala customizada via CSS custom properties, etc.>:

| Token | Valor | Referência de uso | Uso típico |
|-------|-------|------------------|------------|
| xs / 1 | 4px | `p-1` / `padding: var(--space-xs)` | Espaçamento mínimo interno |
| sm / 2 | 8px | `p-2` / `padding: var(--space-sm)` | Espaçamento interno de componentes pequenos |
| md / 3 | 12px | `p-3` / `padding: var(--space-md)` | Padding de inputs e badges |
| lg / 4 | 16px | `p-4` / `padding: var(--space-lg)` | Padding padrão de cards e seções |
| xl / 6 | 24px | `p-6` / `padding: var(--space-xl)` | Padding de containers principais |
| 2xl / 8 | 32px | `p-8` / `padding: var(--space-2xl)` | Espaçamento entre seções |
| 3xl / 12 | 48px | `py-12` / `padding: var(--space-3xl)` | Espaçamento de blocos grandes |
| 4xl / 16 | 64px | `py-16` / `padding: var(--space-4xl)` | Espaçamento de seções hero |

> **Nota:** A coluna "Referência de uso" deve refletir a convenção real do projeto — classes Tailwind, CSS custom properties, props de componentes ou outra convenção.

## Regras de Uso
- Padding interno de componentes: usar escala xs–lg
- Gap entre elementos de lista: usar escala xs–sm
- Padding de containers/páginas: usar escala xl–2xl
- Nunca usar valores arbitrários — ajustar para o token mais próximo

## Grade e Layout
- Container máximo: <valor e convenção do projeto>
- Colunas: grid com gap padrão do projeto
```

**Checklist de qualidade:**
- [ ] Escala base declarada — derivada das configurações do projeto (não assumida)
- [ ] Ao menos 8 tokens com valor em px, referência de uso e uso típico
- [ ] Regras claras de quando usar cada faixa da escala
- [ ] Regra explícita contra valores arbitrários
- [ ] Informações de container e grade do projeto

---

### components.md

**Propósito:** Especificar todos os componentes base (da biblioteca detectada — shadcn/ui, MUI, Radix, etc.) e compostos reutilizáveis — variantes, estados, quando usar cada um.

**Estrutura obrigatória:**
```markdown
# Componentes

## Componentes Base

### Button
> **Nota:** Documente variantes e tamanhos conforme a biblioteca detectada. Exemplos abaixo usam convenção de props (shadcn/ui); adapte para classes CSS, tokens ou props da biblioteca do projeto.

**Variantes:**
| Variante | Referência (prop / classe / token) | Quando usar |
|----------|-----------------------------------|-------------|
| primary | ex: `variant="default"` / `.btn-primary` | Ação principal da tela — máximo 1 por seção |
| secondary | ex: `variant="secondary"` / `.btn-secondary` | Ação secundária, alternativa à principal |
| destructive | ex: `variant="destructive"` / `.btn-danger` | Ações irreversíveis (deletar, cancelar) |
| outline | ex: `variant="outline"` / `.btn-outline` | Ação terciária, menor peso visual |
| ghost | ex: `variant="ghost"` / `.btn-ghost` | Ações em toolbars, menus, áreas densas |
| link | ex: `variant="link"` / `.btn-link` | Navegação inline no texto |

**Tamanhos:** documentar conforme a biblioteca (ex: `size="sm"` | `size="default"` | `size="lg"` ou classes equivalentes)

**Estados:**
- Loading: usar `disabled` + spinner interno — nunca desabilitar sem feedback visual
- Disabled: `disabled` prop — explicar por que via tooltip quando não for óbvio

**Regras:**
- Nunca mais de um botão `default` por seção visual
- Botões destrutivos sempre pedem confirmação (modal ou popover)

---

### Input
**Estados obrigatórios a implementar:**
- Default, Focus (ring visível), Error (borda destructive + mensagem abaixo), Disabled, Loading (readonly + skeleton)

**Regras:**
- Todo input tem `<label>` associado via `htmlFor` — nunca placeholder como substituto de label
- Mensagem de erro fica abaixo do input, nunca acima ou como tooltip
- Usar `aria-describedby` apontando para a mensagem de erro

---

### <outros componentes shadcn instalados>
...

---

## Componentes Compostos Reutilizáveis

### PageHeader
Usado em: todas as páginas principais
```tsx
<PageHeader
  title="string"
  description="string (opcional)"
  action={<Button>...</Button>} // opcional
/>
```
**Regras:** Sempre no topo do conteúdo principal, abaixo da navegação.

### EmptyState
Usado quando: lista ou resultado de busca está vazio
```tsx
<EmptyState
  icon={<Icon />}
  title="string"
  description="string"
  action={<Button>...</Button>} // opcional
/>
```

### LoadingSpinner / Skeleton
- `LoadingSpinner`: carregamento de página inteira ou ação de botão
- `Skeleton`: carregamento de conteúdo que vai aparecer (preserva layout)
```

**Checklist de qualidade:**
- [ ] Cada componente da biblioteca detectada tem entrada no arquivo
- [ ] Button (ou equivalente) tem todas as variantes documentadas com quando usar cada uma
- [ ] Todos os estados de Input estão declarados (default, focus, error, disabled)
- [ ] Regra de acessibilidade de label está explícita
- [ ] Componentes compostos têm interface (props), uso e regras declarados
- [ ] Distinção clara entre componentes base e compostos reutilizáveis

---

### themes.md

**Propósito:** Definir os temas do projeto (light/dark) e como as variáveis CSS se mapeiam para cada tema.

**Estrutura obrigatória:**
```markdown
# Temas

## Temas Disponíveis
| Tema | Classe CSS | Ativo quando |
|------|-----------|--------------|
| Light | `:root` (padrão) | Preferência do sistema ou seleção manual |
| Dark | `.dark` | Preferência do sistema ou seleção manual |

## Variáveis CSS por Tema

| Variável | Light | Dark | Token semântico |
|----------|-------|------|----------------|
| `--background` | 0 0% 100% | 224 71% 4% | `background` |
| `--foreground` | 224 71% 4% | 213 31% 91% | `foreground` |
| `--primary` | ... | ... | `primary` |
| `--primary-foreground` | ... | ... | `primary-foreground` |
| ... | | | |

## Como Adicionar um Novo Tema
1. Criar seletor CSS ou mecanismo de ativação (ex: `.theme-brand`, `[data-theme="brand"]`)
2. Redefinir as variáveis CSS ou tokens relevantes
3. Aplicar o seletor/mecanismo no elemento raiz conforme a estratégia do projeto

## Como o Projeto Ativa/Troca o Tema
<descrever a estratégia real encontrada no projeto: next-themes, CSS puro, contexto React, atributo data-theme, etc.>
```

**Checklist de qualidade:**
- [ ] Todos os temas disponíveis estão declarados
- [ ] Tabela de variáveis CSS (ou equivalente) cobre todos os tokens de `colors.md`
- [ ] Instrução de como adicionar novo tema
- [ ] Documentado como o projeto ativa/troca o tema (estratégia real encontrada)
- [ ] Derivado dos arquivos de estilo encontrados — não inventado

---

## Regras gerais de formato

- **Idioma:** português para títulos e descrições; nomes de classes, tokens e props em inglês
- **Sem valores inventados:** tudo derivado das configurações e código encontrados no projeto
- **Referências cruzadas:** `typography.md` referencia cores de `colors.md`; `components.md` referencia ambos
- **Exemplos de código:** usar blocos de código para classes Tailwind e props de componentes
- **Tom:** prescritivo — "usar X para Y", "nunca Z"

---

## Referências

- Formato do artefato (customizável): `docs/sdd/design-system-format.md`
- Guia de entrevista: `references/interview-guide.md`
