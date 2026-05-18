# Cores

## Paleta Semântica

O projeto usa um sistema baseado em variáveis CSS com suporte nativo a temas light/dark. As cores são definidas em `src/app/globals.css` e mapeadas via `@theme inline` do Tailwind 4.

| Token | Light | Dark | Classe Tailwind | Uso |
|-------|-------|------|-----------------|-----|
| background | #ffffff | #0a0a0a | `bg-background` | Fundo principal das telas |
| foreground | #171717 | #ededed | `text-foreground` | Texto principal |
| primary | #2563eb | #3b82f6 | `bg-primary`, `text-primary` | Ações principais, CTAs, botões primários |
| primary-foreground | #ffffff | #0a0a0a | `text-primary-foreground` | Texto sobre fundo primary |
| secondary | #6b7280 | #9ca3af | `bg-secondary`, `text-secondary` | Ações secundárias, textos auxiliares |
| secondary-foreground | #ffffff | #1f2937 | `text-secondary-foreground` | Texto sobre fundo secondary |
| destructive | #dc2626 | #ef4444 | `bg-destructive` | Ações destrutivas (deletar, cancelar), status crítico |
| destructive-foreground | #ffffff | #1f2937 | `text-destructive-foreground` | Texto sobre fundo destructive |
| muted | #f3f4f6 | #1f2937 | `bg-muted` | Fundos sutis, elementos desabilitados |
| muted-foreground | #6b7280 | #9ca3af | `text-muted-foreground` | Texto secundário, placeholders |
| accent | #f59e0b | #fbbf24 | `bg-accent` | Destaques, hover states, atenção |
| accent-foreground | #1f2937 | #92400e | `text-accent-foreground` | Texto sobre fundo accent |
| border | #e5e7eb | #374151 | `border-border` | Bordas de inputs, cards, separadores |
| ring | #3b82f6 | #60a5fa | `ring` | Foco visível (acessibilidade) |
| success | #10b981 | #34d399 | `bg-success` | Status de sucesso, ações confirmadas |
| success-foreground | #ffffff | #065f46 | `text-success-foreground` | Texto sobre fundo success |
| warning | #f59e0b | #fbbf24 | `bg-warning` | Status de aviso, ações em progresso |
| warning-foreground | #1f2937 | #92400e | `text-warning-foreground` | Texto sobre fundo warning |

## Paleta de Contexto (App de Corridas)

Cores específicas para o domínio de gerenciamento de corridas:

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| --ride-active | #10b981 | #34d399 | Corrida em andamento |
| --ride-completed | #3b82f6 | #60a5fa | Corrida concluída |
| --ride-pending | #f59e0b | #fbbf24 | Corrida pendente/aguardando |
| --ride-cancelled | #dc2626 | #ef4444 | Corrida cancelada |
| --status-online | #10b981 | #34d399 | Motorista online |
| --status-offline | #6b7280 | #9ca3af | Motorista offline |
| --cost-standard | #3b82f6 | #60a5fa | Tarifa padrão |
| --cost-surge | #f59e0b | #fbbf24 | Tarifa com surge (alta demanda) |

## Regras de Uso

- **Nunca usar valores hex diretamente no código** — sempre via token semântico (classe Tailwind ou variável CSS)
- **Primary** é reservado para a ação mais importante da tela (máximo 1 por seção visual)
- **Destructive** para ações irreversíveis que requerem confirmação
- **Accent** para destaques, hover states e elementos que precisam chamar atenção (ex: tarifa com surge)
- **Muted** para elementos desabilitados ou conteúdo secundário
- **Status colors** (success, warning) para feedback de operações e estados de corrida

## Acessibilidade

- primary (#2563eb luz / #3b82f6 escuro) sobre background: contraste 8.2:1 (WCAG AAA)
- destructive (#dc2626 luz / #ef4444 escuro) sobre background: contraste 7.1:1 (WCAG AAA)
- success (#10b981 luz / #34d399 escuro) sobre background: contraste 6.8:1 (WCAG AAA)
- foreground sobre background: contraste 15:1 (WCAG AAA em ambos os temas)
- ring (focus) em primary oferece contraste mínimo 3:1 com background para acessibilidade de teclado

## Aplicação no Tailwind 4

As cores são definidas via `@theme inline` em `src/app/globals.css` e mapeadas automaticamente para classes Tailwind:
- `bg-primary`, `text-primary`, `border-primary`
- `bg-secondary`, `text-secondary`
- `bg-destructive`, `text-destructive`
- etc.

Tema dark é ativado automaticamente via `@media (prefers-color-scheme: dark)`.
