# Guia de Entrevista — Criação de Cenários BDD

## Princípios da entrevista

1. **Uma pergunta por vez.** Nunca faça duas perguntas na mesma mensagem.

2. **PRD e Stories são as fontes primárias.** Derive o máximo possível antes de perguntar. Perguntas são para lacunas que os artefatos não respondem.

3. **Perguntas abertas, não de confirmação.** Prefira "O que acontece quando o entregador já tem uma sessão ativa?" a "Devemos redirecionar para o dashboard nesse caso?".

4. **Foco em comportamento observável.** Se um cenário candidato descreve estado interno do sistema (banco, JWT, token), pergunte como isso se manifesta para o usuário.

5. **Não crie cenários fora do escopo.** Se o usuário pedir um cenário para algo na seção "Fora do Escopo" do PRD, recuse gentilmente citando o trecho.

---

## Quando aceitar vs. aprofundar

**Aceite** quando:
- Todos os itens do checklist do cenário estão cobertos
- O título identifica claramente o comportamento sem ler os passos
- `Given`, `When` e `Then` usam linguagem de domínio, sem detalhes técnicos
- O resultado (`Then`) é observável e verificável

**Aprofunde** quando:
- O `Then` descreve estado interno ("o sistema salva no banco", "o token é invalidado")
- O `Given` é vago ("dado que o sistema está funcionando")
- O `When` mistura duas ações distintas
- O título não distingue este cenário dos demais ("Cenário de login")
- Um único cenário cobre happy path e erro ao mesmo tempo

---

## Banco de perguntas por parte do cenário

### `Given` — pré-condição

Use quando o estado inicial está vago ou ausente.

- "Qual é a situação do entregador ou do sistema antes de essa ação acontecer?"
- "Essa estória pressupõe alguma pré-condição do PRD (ex: conta já criada, sessão ativa)?"
- "Esse cenário funciona para qualquer entregador ou apenas para um com características específicas?"

### `When` — ação

Use quando a ação está descrita em termos técnicos ou é ambígua.

- "Como o entregador executa essa ação? O que ele faz na interface?"
- "Essa ação é iniciada pelo usuário ou é um evento do sistema?"
- "O que especificamente caracteriza essa ação como inválida/válida nesse contexto?"

### `Then` — resultado

Use quando o resultado não é observável ou é genérico.

- "O que o entregador vê ou recebe como resposta quando essa ação acontece?"
- "Como um QA saberia, apenas observando o sistema, que esse comportamento ocorreu?"
- "Além da mensagem principal, há algum efeito colateral visível (redirecionamento, notificação, mudança de estado na tela)?"

### Cobertura de cenários

Use quando o conjunto parece incompleto.

- "O PRD menciona [fluxo alternativo X]. Esse fluxo já está coberto por algum cenário ou precisa de um novo?"
- "Há algum edge case que o time de QA provavelmente tentaria testar e que ainda não está mapeado?"
- "Os critérios de aceitação da Estória [N] estão todos cobertos por pelo menos um cenário?"

---

## Sinais de alerta — rascunhos que pedem aprofundamento

| Problema observado | Como aprofundar |
|---|---|
| `Then` menciona banco de dados ou JWT | "Como o entregador percebe esse resultado externamente?" |
| `Given` descreve uma ação ("dado que o entregador clicou em...") | "Esse passo é uma ação — pode ser movido para `When` ou virar um cenário separado?" |
| Título genérico ("Cenário de sucesso") | "O que diferencia este cenário dos demais? O título deve identificar o comportamento específico." |
| `When` tem dois verbos de ação ("envia e aguarda") | "Essas são duas ações separadas? Faz sentido dividir em dois cenários?" |
| Cenário sem `Given` quando o contexto é relevante | "Há alguma pré-condição que precisa estar satisfeita para esse comportamento acontecer?" |
| Conjunto sem cenário de edge case | "Há alguma situação limite (sessão expirada, código já usado, campo vazio) ainda não coberta?" |

---

## Ritmo da entrevista

- Sempre anuncie qual cenário ou grupo está sendo construído: `[Cenário 3/<N>: <Título>]`
- Mostre o rascunho Gherkin gerado antes de perguntar
- Após incorporar a resposta, mostre o rascunho atualizado
- Quando um cenário estiver pronto: `✅ Cenário <N> concluído.`
- Aceite pedidos de pular ou remover cenários sem resistência; ajuste a numeração implícita

---

## Como derivar cenários do PRD e das User Stories

### Do Fluxo Principal do PRD

- O fluxo principal inteiro → 1 cenário de sucesso (happy path)
- Cada entrada do usuário descrita no fluxo → verificar se exige um cenário próprio

### Dos Fluxos Alternativos do PRD

- Cada fluxo alternativo → 1 cenário de estado inválido ou erro

### Dos Critérios de Sucesso do PRD

- Cada critério mensurável → verificar se há um cenário que o valida

### Das Estórias de Usuário

- Cada critério de aceitação → ao menos 1 cenário que o cobre
- Critérios de validação ("O sistema deve rejeitar...") → cenário de erro dedicado
- Critérios de segurança → cenário de edge case ou restrição

### Da seção Fora do Escopo do PRD

- Use como **filtro negativo**: nenhum cenário deve cobrir itens listados aqui
