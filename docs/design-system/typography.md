# Tipografia

## Famílias de Fonte

O projeto usa as fontes **Geist Sans** (texto geral) e **Geist Mono** (código/dados técnicos), ambas carregadas via Google Fonts em `src/app/layout.tsx`.

| Família | Variável CSS | Classe Tailwind | Uso |
|---------|-----------|------------------|-----|
| Geist Sans | `var(--font-geist-sans)` | `font-sans` | Texto geral, labels, botões, conteúdo |
| Geist Mono | `var(--font-geist-mono)` | `font-mono` | Código, valores técnicos, IDs, timestamps |

## Escala Tipográfica

Escala baseada em **typographic scale 1.25** (Perfect Fourth), otimizada para mobile:

| Nível | Classe Tailwind | Tamanho | Peso | Line Height | Uso |
|-------|-----------------|---------|------|-------------|-----|
| Display | `text-5xl font-bold` | 48px | 700 | 1.1 | Títulos hero de página, telas de impacto |
| H1 | `text-4xl font-bold` | 36px | 700 | 1.2 | Título principal de página |
| H2 | `text-2xl font-semibold` | 24px | 600 | 1.3 | Seções principais, cards de destaque |
| H3 | `text-xl font-semibold` | 20px | 600 | 1.4 | Subseções, títulos de componentes |
| Subtitle | `text-lg font-medium` | 18px | 500 | 1.5 | Subtítulos, textos introdutórios |
| Body | `text-base` | 16px | 400 | 1.6 | Texto corrido, descrições, conteúdo principal |
| Small | `text-sm` | 14px | 400 | 1.5 | Labels, helper text, metadados |
| Caption | `text-xs` | 12px | 400 | 1.4 | Legendas, tooltips, timestamps |

## Regras de Uso

- **Display/H1**: títulos de página — máximo um por tela
- **H2**: divisões principais de conteúdo
- **H3**: títulos de cards, seções menores
- **Subtitle**: introdução de conteúdo ou contexto
- **Body**: padrão para texto corrido; todos os inputs, labels e descrições usam este ou Small
- **Small**: labels de inputs, helper text, datas, IDs de corrida
- **Caption**: timestamps secundários, legendas de imagens, nota legal
- **Nunca usar tamanhos arbitrários fora da escala** — sempre usar classes Tailwind definidas acima

## Peso da Fonte

- **700 (Bold)**: títulos H1, Display
- **600 (Semibold)**: títulos H2, H3; labels de destaque
- **500 (Medium)**: subtítulos, botões
- **400 (Regular)**: corpo de texto, conteúdo padrão

## Contraste de Cor

Todas as combinações de tamanho de texto seguem a paleta de `colors.md`:
- Títulos (H1–H3): `text-foreground` por padrão
- Corpo (Body–Caption): `text-foreground` ou `text-muted-foreground` conforme contexto
- Links: `text-primary` com `underline` em hover
- Estados desabilitados: `text-muted-foreground`

## Acessibilidade

- **Line height mínimo 1.4** para legibilidade — maior em textos corridos (1.6)
- **Tamanho mínimo 16px** para inputs (evita zoom automático em mobile Safari)
- **Contraste mínimo 4.5:1** para texto normal (verificar em `colors.md`)
- Títulos podem usar 3:1 (WCAG AA large text)
