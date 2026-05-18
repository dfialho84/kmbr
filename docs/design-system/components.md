# Componentes

## Estratégia de Componentes

Este projeto usa **shadcn/ui** como biblioteca de componentes base — um conjunto de componentes React sem estilos, construídos sobre Radix UI e estilizados com Tailwind CSS.

## Componentes Base

### Button

Botão com 4 variantes principais otimizadas para mobile.

**Variantes:**

| Variante | Props | Quando usar |
|----------|-------|-------------|
| default (primary) | `variant="default"` | Ação principal da tela — máximo 1 por seção |
| secondary | `variant="secondary"` | Ação secundária, alternativa visual à principal |
| destructive | `variant="destructive"` | Ações irreversíveis: deletar, cancelar corrida, logout |
| outline | `variant="outline"` | Ação terciária, menor peso visual |
| ghost | `variant="ghost"` | Ações em menus, toolbars, áreas densas |
| link | `variant="link"` | Navegação inline no texto |

**Tamanhos:**
- `size="default"`: 44px de altura (toque confortável em mobile) — padrão
- `size="sm"`: 32px de altura (ações secundárias, icons)
- `size="lg"`: 48px de altura (CTAs principais, botões hero)

**Estados:**
- **Default**: estado de repouso
- **Hover**: mudança de cor/opacidade (automaticamente via Tailwind)
- **Active/Pressed**: feedback visual (mudança de cor mais pronunciada)
- **Disabled**: `disabled` prop — manter visual diferente; nunca usar sem motivo
- **Loading**: `disabled` + spinner interno — nunca deixar clicável enquanto carrega

**Regras:**
- Nunca mais de um botão `default` por seção visual
- Botões destrutivos sempre pedem confirmação — modal, popover ou toast
- Botão em estado loading mantém espaço (não colapsa) para evitar layout shift
- Altura mínima 44px em mobile (toque acessível)

### Input

Campo de entrada com suporte a estados, validação e acessibilidade.

**Variantes:**
- `type="text"`: texto comum
- `type="email"`: entrada de email com teclado otimizado
- `type="tel"`: entrada de telefone
- `type="number"`: entrada numérica
- `type="password"`: texto mascarado

**Estados obrigatórios a implementar:**
- **Default**: sem interação, placeholder visível
- **Focus**: ring primário visível (via `focus:ring-2`), fundo sem mudança
- **Error**: borda `border-destructive`, mensagem de erro abaixo em `text-destructive`
- **Disabled**: fundo `bg-muted`, texto `text-muted-foreground`, sem interação
- **Loading/Readonly**: readonly, sem interação, dica visual

**Regras:**
- Todo input tem `<label>` associado via `htmlFor` — nunca placeholder como substituto
- Mensagem de erro fica **abaixo** do input, nunca acima ou como tooltip
- Usar `aria-describedby` apontando para elemento de erro/helper text
- Ícones de validação (check, X) aparecem à direita do input — opcional em mobile
- Tamanho mínimo 16px para texto (evita zoom automático em mobile Safari)

### Card

Container visual para agrupar conteúdo relacionado.

**Estrutura:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição (opcional)</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo principal */}
  </CardContent>
  <CardFooter>
    {/* Ações (opcional) */}
  </CardFooter>
</Card>
```

**Variantes:**
- Borda padrão (border-border)
- Borda sutil (border-muted)
- Shadow padrão ou shadow-none para mobile (evitar sombra pesada em telas pequenas)

**Uso:**
- Contêiner padrão para informações (detalhes de corrida, perfil, histórico)
- Grupos de campos relacionados
- Seções de resultado de busca

### Dialog / AlertDialog

Diálogo modal para confirmações, alertas e formulários inline.

**Dialog (genérico):**
- Usado para formulários, captura de input
- Permite interação com overlay clicável para fechar

**AlertDialog (confirmação):**
- Usado para ações destrutivas (deletar, cancelar)
- Overlay não clicável — força escolha explícita (Cancel/Confirm)
- Botão destrutivo em vermelho

**Regras:**
- Dialog mobile: usar full-screen ou máximo 90% da altura
- Sempre oferecer botão "Cancelar"
- Ação destrutiva sempre à direita (ou em segundo lugar)
- Title e Description obrigatórios (acessibilidade)

### Select

Campo de seleção com dropdown (alternativa a `<select>` nativo).

**Estados:**
- Closed: mostrar valor selecionado ou placeholder
- Open: dropdown visível com opções
- Disabled: input e dropdown cinzas

**Regras:**
- Usar para listas com 3+ opções (inputs de 2 usar radio ou checkbox)
- Rótulo obrigatório via `<label>`
- Placeholder visível quando nenhuma opção selecionada

### Badge

Rótulo pequeno para status, categorias ou tags.

**Variantes:**
- `variant="default"`: fundo primary, texto white
- `variant="secondary"`: fundo secondary, texto foreground
- `variant="destructive"`: fundo destructive, texto white
- `variant="outline"`: apenas borda, sem fundo

**Uso:**
- Status de corrida: "Ativa", "Concluída", "Cancelada"
- Categorias: "Premium", "Econômico"
- Tags: "Verificado", "Novo"

**Regras:**
- Nunca usar como substituto de botão (não clicável)
- Texto curto, máximo 2–3 palavras
- Cor deve refletir significado (destrutivo para estado negativo)

### Textarea

Campo de entrada multilinha.

**Estrutura similar ao Input:**
- Label associado
- Helper text abaixo
- Mensagem de erro em text-destructive
- Ring de focus visível

**Regras:**
- Resize: `resize-vertical` apenas (permitir ajuste de altura)
- Altura mínima: 3 linhas (aproximadamente 80px)
- Caracteres restantes opcional (ex: "120/200 caracteres")

### Toast / Notification

Notificação transitória para feedback de ações.

**Variantes:**
- `variant="default"`: informação
- `variant="success"`: ação concluída
- `variant="destructive"`: erro
- `variant="warning"`: aviso

**Regras:**
- Aparecem no topo ou canto inferior (a decidir por feature)
- Desaparecem automaticamente após 3–4 segundos
- Cancelável manualmente (ícone X)
- Acessível via ARIA live region

## Componentes Compostos Reutilizáveis

### RideCard

Card específico para exibir resumo de uma corrida.

```tsx
<RideCard
  id="ride-123"
  status="active" | "completed" | "pending" | "cancelled"
  pickupLocation="Avenida Paulista, 1000"
  dropoffLocation="Rua Augusta, 2500"
  distance="8.5 km"
  estimatedCost="R$ 25,50"
  actualCost="R$ 27,30" // opcional, preenchido se concluída
  driverName="João Silva"
  driverRating={4.8}
  vehicleInfo="Prata, Hyundai HB20"
  onCancel={() => {}} // opcional
/>
```

**Usado em:**
- Tela de histórico de corridas
- Tela de corrida ativa
- Busca de corridas

### PageHeader

Cabeçalho padrão para páginas principais.

```tsx
<PageHeader
  title="Histórico de Corridas"
  subtitle="Últimas 30 dias" // opcional
  action={<Button>Nova Corrida</Button>} // opcional
  backButton // opcional
/>
```

**Regras:**
- Sempre no topo do conteúdo principal
- Abaixo da navegação (navbar/header do app)
- Padding respeitando escala de spacing.md

### EmptyState

Tela vazia quando lista, resultado de busca ou filtro não retorna dados.

```tsx
<EmptyState
  icon={<Icon />}
  title="Nenhuma corrida"
  description="Você ainda não tem corridas no histórico."
  action={<Button>Iniciar uma corrida</Button>} // opcional
/>
```

**Usado em:**
- Lista de corridas vazia
- Resultado de busca sem matches
- Filtros sem resultados

### LoadingSpinner

Spinner de carregamento para aguardar operações assíncronas.

```tsx
<LoadingSpinner
  size="default" | "sm" | "lg"
  message="Carregando..." // opcional
/>
```

**Usado em:**
- Carregamento de página
- Carregamento de ação de botão (ex: "Confirmar Pagamento")

### SkeletonLoader

Skeleton para carregamento de conteúdo que será renderizado (preserva layout).

```tsx
<SkeletonLoader
  variant="card" | "text" | "line" | "avatar"
  count={3}
/>
```

**Usado em:**
- Carregamento de lista de corridas (skeleton cards)
- Carregamento de detalhes de corrida

### ErrorBoundary

Componente de limite de erro para capturar falhas em subárvores React.

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <SomeComponent />
</ErrorBoundary>
```

**Regras:**
- Envolver componentes de página ou seções críticas
- Mostrar mensagem amigável ao usuário
- Oferecer botão de retry

### ConfirmDialog

Dialog de confirmação para ações com consequência.

```tsx
<ConfirmDialog
  title="Cancelar corrida?"
  description="Você perderá a reserva. Esta ação não pode ser desfeita."
  cancelText="Voltar"
  confirmText="Cancelar Corrida"
  onConfirm={() => {}}
  isDestructive
/>
```

**Usado em:**
- Cancelar corrida
- Deletar histórico
- Logout

## Instalação e Atualização

Os componentes shadcn/ui são instalados sob demanda via CLI:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
# etc.
```

Após adicionar um novo componente, registrar em `components.md` com suas variantes, estados e regras de uso.
