# Guia de Entrevista — Extração de Telas/Views

## Princípios da extração

1. **Derive antes de perguntar.** Componentes, campos e mensagens de erro são extraíveis
   diretamente dos Scenarios — pergunte apenas o que os artefatos não respondem.

2. **Uma pergunta por vez.** Se dois itens estão vagos, escolha o mais crítico.

3. **Perguntas abertas, não de confirmação.** Prefira "Quais são os estados possíveis
   desta tela?" a "A tela tem estado de carregamento?".

4. **Mensagens de erro são literais.** Nunca parafraseie os `Then` — copie exatamente.

5. **Referências Visuais são sempre vazias.** Nunca pergunte sobre wireframes ou mockups
   — deixe os placeholders padrão.

6. **Telas de outra feature são referências externas.** Não documente telas que pertencem
   a outras features — anote apenas o nome/URL como referência de navegação.

---

## Quando aceitar vs. aprofundar

**Aceite** quando:
- Todos os campos de formulário mencionados no `Then` estão na tabela de Componentes
- Mensagens de erro são cópias literais dos `Then` do `.feature`
- O objetivo da tela é orientado ao usuário (não descreve implementação)
- A seção Referências Visuais contém apenas os 3 placeholders padrão

**Aprofunde** quando:
- Há campos mencionados nos Scenarios que não aparecem nos Componentes
- Uma mensagem de erro está parafraseada em vez de copiada literalmente
- O objetivo descreve implementação ("salva no banco", "envia POST para /api/")
- O Estado de Carregamento está ausente mas os Scenarios descrevem operação assíncrona
- A seção Considerações está vazia mas os Scenarios têm `Scenario Outline` com validações

---

## Como derivar componentes do Gherkin

### `Given` → Nome da tela
```gherkin
Given que o visitante está na página de cadastro
```
→ Tela: **Página de Cadastro** (`pagina-de-cadastro`)

### `When` → Botões e ações
```gherkin
When o visitante preenche todos os campos obrigatórios com dados válidos e envia o formulário
```
→ Botão: **Enviar** (tipo: submit, comportamento: submete o formulário de cadastro)

### `Then` com `formulário com os campos` → Tabela de campos
```gherkin
Then o sistema exibe um formulário com os campos nome, email, senha, confirmação de senha, data de nascimento e foto de perfil
```
→ Campos: nome (text), email (email), senha (password), confirmação de senha (password),
   data de nascimento (date), foto de perfil (file)

### `Then ... é levado para` / `Then ... vê a página` → Links de navegação / Estado de Sucesso
```gherkin
Then o visitante é levado para a página de cadastro
```
→ Link de navegação na tela atual; ou Estado de Sucesso de outra tela

### `Then ... vê ... com mensagem` → Estado de Sucesso ou Estado de Erro
```gherkin
Then o visitante vê uma tela informando que um link de confirmação foi enviado ao seu email
```
→ Estado de Sucesso: "Uma tela informando que um link de confirmação foi enviado"

### URLs explícitas → URL da tela
```gherkin
Then o visitante vê a página de confirmação "/confirm" com mensagem de sucesso
```
→ URL: `/confirm`

### `Scenario Outline` + `Examples` → Tabela de erros (Estado de Erro)
```gherkin
| email já associado a uma conta existente | Este email já está cadastrado. Tente fazer login ou use outro endereço. |
```
→ Mensagem de erro literal: `"Este email já está cadastrado. Tente fazer login ou use outro endereço."`

---

## Banco de perguntas por seção

### Visão Geral

Use quando o objetivo ou URL não são claros nos artefatos.

- "Qual é o objetivo principal desta tela do ponto de vista do usuário?"
- "Esta tela tem uma URL definida? Ela aparece no PRD ou nos Scenarios?"
- "O nome '<nome derivado>' é como essa tela é conhecida no produto, ou tem outro nome?"

### Campos de formulário

Use quando há campos mencionados nos Scenarios que precisam de mais detalhes.

- "O campo '<campo>' aceita que tipo de entrada? Texto livre, seleção de opções, upload de arquivo?"
- "Algum campo tem valor padrão pré-preenchido ao carregar a tela?"
- "Existe algum campo que aparece condicionalmente (só se outro campo for preenchido)?"

### Botões e ações

Use quando os `When` descrevem ações mas não deixam claro o rótulo do botão.

- "Como o botão que envia o formulário é rotulado na interface?"
- "Além de enviar o formulário, há outros botões de ação nesta tela? (ex: cancelar, limpar)"
- "O que acontece com o botão durante o envio — ele fica desabilitado, mostra um spinner?"

### Estado de carregamento

Use quando os Scenarios descrevem operação assíncrona mas não detalham o feedback.

- "O que o usuário vê enquanto o sistema processa o envio do formulário?"
- "O botão de envio fica desabilitado durante o processamento?"

### Estado de erro

Use quando mensagens de erro estão incompletas ou precisam de contexto de exibição.

- "Onde a mensagem de erro '<mensagem>' é exibida — abaixo do campo ou no topo do formulário?"
- "Erros de campo são exibidos individualmente por campo ou em uma lista única?"
- "Há alguma mensagem de erro de rede ou timeout para esta tela?"

### Estado de sucesso

Use quando o `Then` do happy path não é suficientemente detalhado.

- "Após o envio bem-sucedido, o usuário permanece nesta tela ou é redirecionado?"
- "Há alguma mensagem de confirmação ou feedback visual após o sucesso?"

### Considerações de UX

Use quando o PRD ou requirements mencionam regras de validação não cobertas pelos Scenarios.

- "Há regras de formato para o campo '<campo>' que não aparecem nos Scenarios? (ex: máscara, tamanho máximo)"
- "Algum campo tem dica de preenchimento (placeholder) específica?"
- "Esta tela precisa funcionar em dispositivos móveis? Há alguma adaptação de layout prevista?"

---

## Ritmo da extração

- Sempre anuncie qual tela está sendo processada: `[Tela X/N: <Nome>]`
- Mostre o rascunho completo do `tela.md` antes de perguntar
- Após incorporar resposta, mostre o rascunho atualizado
- Quando uma tela estiver pronta: `✅ Tela X concluída: docs/features/<slug>/views/<nome>/tela.md`
- Aceite pedidos de pular ou remover telas sem resistência; ajuste a numeração implícita

---

## Sinais de alerta — rascunhos que pedem aprofundamento

| Problema observado | Como aprofundar |
|---|---|
| Mensagem de erro parafraseada | Copie exatamente o texto do `Then` do `.feature` |
| Campo de formulário ausente | Verifique o `Then ... exibe um formulário com os campos` |
| Objetivo descreve implementação | "Como o usuário descreveria o que faz nessa tela?" |
| Estado de Carregamento ausente em tela com envio | "O que o usuário vê enquanto aguarda a resposta?" |
| Seção Referências Visuais preenchida | Apague o conteúdo e substitua pelos 3 placeholders padrão |
| Botão com nome técnico ("handleSubmit") | Use o rótulo como aparece na UI — derive dos Scenarios ou pergunte |
| Link de navegação sem destino claro | Derive do `Then ... é levado para` ou pergunte a URL de destino |
