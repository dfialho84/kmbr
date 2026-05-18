# Espaçamento

## Escala Base

O projeto usa a **escala padrão do Tailwind CSS** (múltiplos de 4px), que é o padrão de facto para aplicações mobile e desktop.

| Token | Valor | Classe Tailwind | Variável CSS | Uso típico |
|-------|-------|-----------------|--------------|------------|
| xs / 1 | 4px | `p-1` / `m-1` | `--space-xs` | Espaçamento mínimo, gaps muito pequenos |
| sm / 2 | 8px | `p-2` / `m-2` | `--space-sm` | Padding de badges, gaps pequenos |
| md / 3 | 12px | `p-3` / `m-3` | `--space-md` | Padding de inputs pequenos, gaps de elementos inline |
| lg / 4 | 16px | `p-4` / `m-4` | `--space-lg` | Padding de inputs, cards pequenos, gap padrão de listas |
| xl / 6 | 24px | `p-6` / `m-6` | `--space-xl` | Padding padrão de cards e containers |
| 2xl / 8 | 32px | `p-8` / `m-8` | `--space-2xl` | Padding de seções, espaçamento entre blocos |
| 3xl / 12 | 48px | `py-12` / `m-12` | `--space-3xl` | Espaçamento entre seções maiores |
| 4xl / 16 | 64px | `py-16` / `m-16` | `--space-4xl` | Espaçamento entre blocos hero e conteúdo |

## Regras de Uso

- **Padding interno de componentes (Button, Input, Badge):** xs–lg (4–16px)
- **Gap entre elementos de lista:** sm–md (8–12px)
- **Padding de cards:** lg–xl (16–24px)
- **Padding de containers/páginas:** xl–2xl (24–32px) — em mobile, considerar xl como padrão
- **Espaçamento vertical entre seções:** 2xl–3xl (32–48px) — em mobile, preferir 2xl
- **Nunca usar valores arbitrários** — ajustar sempre para o token mais próximo na escala

## Grade e Layout

### Container máximo
- `max-w-2xl` (560px) em telas desktop
- Full width em mobile (sem max-width)

### Padding de página
- Desktop: `px-8` (32px de cada lado)
- Mobile: `px-4` (16px de cada lado) — usar `sm:px-6` para tablets

### Gap de grid/flex
- Padrão: `gap-4` (16px)
- Compacto: `gap-2` (8px) para listas densas
- Espaçoso: `gap-6` (24px) para seções de destaque

## Escala Visual (Mobile-First)

Para aplicativos mobile, preferir:
1. **xs** (4px): nunca usar isolado, apenas para ajustes finos
2. **sm** (8px): gaps entre elementos tight, usado com moderação
3. **md** (12px): gaps padrão em seções densas
4. **lg** (16px): padding padrão, gap de listas comuns
5. **xl** (24px): padding de cards, separação de seções
6. **2xl** (32px): padding de containers principais

Evitar 3xl (48px) e 4xl (64px) em mobile a não ser em seções hero deliberadamente espaçosas.
