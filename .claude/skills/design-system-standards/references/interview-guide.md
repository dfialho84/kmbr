# Guia de Entrevista — Design System

## Princípios

1. **Extraia antes de perguntar.** As configurações do projeto são a fonte primária — extraia de qualquer arquivo encontrado (CSS, tokens de design, configuração de UI lib). Se está lá, não pergunte.
2. **Uma pergunta por vez.**
3. **Perguntas são sobre decisões não tomadas** — não sobre o que já está configurado.

---

## Banco de perguntas por arquivo

### colors.md

Use quando as cores não estão nas configurações encontradas.

- "O projeto tem uma cor de marca principal? Pode ser um hex, HSL, RGB ou nome de cor."
- "Há uma cor para estados de erro/destrutivo, ou usamos vermelho como padrão semântico?"
- "O projeto vai ter modo escuro? Isso impacta se definimos as cores como variáveis CSS ou valores fixos."

### typography.md

Use quando fontes não estão configuradas no projeto.

- "Há uma fonte específica para este projeto ou usamos a sans-serif padrão do sistema?"
- "O projeto tem um nível tipográfico de 'display' (títulos grandes de hero) ou começa no H1?"

### spacing.md

Use quando o projeto tem espaçamentos customizados não óbvios.

- "O projeto usa uma escala de espaçamento customizada ou a padrão da lib de estilos?"
- "Qual é o padding padrão dos containers de página? (ex: pequeno no mobile, maior no desktop)"

### components.md

Use para decisões de uso de componentes não deriváveis do código.

- "Quando usar o botão de menor peso visual vs. o fantasma (ghost)? Há uma regra no projeto?"
- "O projeto tem um componente de estado vazio (EmptyState) reutilizável ou cada feature cria o seu?"
- "Há outros componentes compostos que aparecem em mais de uma tela além de PageHeader e EmptyState?"
- "Qual o comportamento padrão de loading — skeleton (preserva layout) ou spinner (substitui conteúdo)?"

### themes.md

Use quando a estratégia de temas não está clara no código.

- "O projeto vai suportar modo escuro desde o início ou é pós-MVP?"
- "A troca de tema é manual (botão na UI) ou segue a preferência do sistema operacional?"

---

## O que não perguntar

- Valores que estão em qualquer arquivo de configuração encontrado — extraia diretamente
- Variáveis CSS que estão em qualquer arquivo CSS encontrado — extraia diretamente
- Componentes já instalados — liste com Glob no diretório de componentes detectado no Passo 0
- O que já está instalado — derive varrendo os diretórios e arquivos de configuração encontrados
