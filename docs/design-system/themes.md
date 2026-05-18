# Temas

## Temas Disponíveis

O projeto suporta dois temas: **Light** (padrão) e **Dark** (automático via preferência do sistema).

| Tema | Seletor CSS | Ativo quando |
|------|-----------|--------------|
| Light | `:root` (padrão) | Sem `.dark` ou `prefers-color-scheme: light` |
| Dark | `:root` com `@media (prefers-color-scheme: dark)` | `prefers-color-scheme: dark` do navegador |

## Variáveis CSS por Tema

As variáveis de cor são definidas em `src/app/globals.css` e usadas via `@theme inline` do Tailwind 4:

| Variável | Light | Dark | Token Semântico | Mapeamento Tailwind |
|----------|-------|------|-----------------|-------------------|
| `--background` | #ffffff | #0a0a0a | `background` | `bg-background` |
| `--foreground` | #171717 | #ededed | `foreground` | `text-foreground` |
| `--color-primary` | #2563eb | #3b82f6 | `primary` | `bg-primary`, `text-primary` |
| `--color-primary-foreground` | #ffffff | #0a0a0a | `primary-foreground` | `text-primary-foreground` |
| `--color-secondary` | #6b7280 | #9ca3af | `secondary` | `bg-secondary`, `text-secondary` |
| `--color-destructive` | #dc2626 | #ef4444 | `destructive` | `bg-destructive` |
| `--color-success` | #10b981 | #34d399 | `success` | `bg-success` |
| `--color-warning` | #f59e0b | #fbbf24 | `warning` | `bg-warning` |
| `--color-muted` | #f3f4f6 | #1f2937 | `muted` | `bg-muted` |
| `--color-accent` | #f59e0b | #fbbf24 | `accent` | `bg-accent` |
| `--color-border` | #e5e7eb | #374151 | `border` | `border-border` |
| `--color-ring` | #3b82f6 | #60a5fa | `ring` | `ring` |

> **Nota:** O mapeamento Tailwind é automático via `@theme inline` — não é necessário adicionar configuração manual.

## Como o Projeto Ativa/Troca o Tema

### Mecanismo Atual

1. **Padrão do navegador:** Usa `@media (prefers-color-scheme: dark)` do CSS
   - Respeita a preferência do sistema operacional do usuário
   - Sem necessidade de JavaScript

2. **Implementação em `src/app/globals.css`:**
   ```css
   :root {
     --background: #ffffff;
     --foreground: #171717;
   }

   @media (prefers-color-scheme: dark) {
     :root {
       --background: #0a0a0a;
       --foreground: #ededed;
     }
   }

   @theme inline {
     --color-background: var(--background);
     --color-foreground: var(--foreground);
     /* ... outras variáveis ... */
   }
   ```

### Próximas Fases (Futuro)

Para adicionar seletor manual de tema (ex: botão light/dark no header):

**Opção 1: Adicionar classe `.dark` dinamicamente**
```tsx
// Trocar tema via JavaScript/React
document.documentElement.classList.toggle('dark');
localStorage.setItem('theme', 'dark'); // persistir preferência
```

Então no CSS:
```css
:root {
  /* variáveis light */
}

:root.dark {
  /* variáveis dark */
}
```

**Opção 2: Usar biblioteca `next-themes`**
```bash
npm install next-themes
```

Mais flexível, com suporte a temas customizados. Documentar quando implementado.

## Adicionar um Novo Tema (ex: Brand/Corporativo)

Se o projeto precisar de um terceiro tema no futuro:

1. **Criar novo seletor CSS em `src/app/globals.css`:**
   ```css
   :root.theme-brand {
     --background: #f8f6ff;
     --foreground: #2d1b4e;
     --color-primary: #7c3aed; /* purple */
     /* ... redefinir variáveis conforme necessário ... */
   }
   ```

2. **Ativar via JavaScript:**
   ```tsx
   document.documentElement.classList.add('theme-brand');
   localStorage.setItem('theme', 'brand');
   ```

3. **Documentar em `themes.md`** com nova linha na tabela de temas e variáveis

## Regras de Implementação de Tema

- **Nunca hardcodar valores de cor** — sempre usar variáveis CSS (`var(--color-primary)`) ou classes Tailwind (`bg-primary`)
- **Testar em ambos os temas** — toda cor deve ser legível em light e dark
- **Contraste mínimo WCAG AA** em ambos os temas (ver `colors.md`)
- **Preferência do sistema é o padrão** — se o usuário não escolheu manualmente, usar `prefers-color-scheme`

## Testes de Tema

### No navegador:
1. Abrir DevTools → More Tools → Rendering
2. "Emulate CSS media feature prefers-color-scheme" → escolher light/dark
3. Verificar se todas as cores mudam apropriadamente

### No código:
```tsx
// Testar qual tema está ativo
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

## Referência Rápida

- **Arquivo CSS:** `src/app/globals.css`
- **Tailwind:** `postcss.config.mjs`, `tailwindcss` v4 via `@tailwindcss/postcss`
- **Próxima etapa:** Implementar seletor manual de tema (butão light/dark) quando necessário — considerar `next-themes`
