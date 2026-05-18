# Guia de Entrevista — Criação de PRD

## Princípios da entrevista

1. **Uma pergunta por vez.** Nunca faça duas perguntas na mesma mensagem. O usuário perde o fio quando precisa responder múltiplas coisas de uma vez.

2. **Perguntas abertas, não de confirmação.** Prefira "Quem vai usar isso?" a "Os entregadores vão usar isso?". Respostas de sim/não raramente revelam o que está faltando.

3. **Use o contexto acumulado.** Cada seção deve referenciar o que já foi dito. Se o usuário mencionou "entregadores cadastrados" na Visão Geral, não pergunte sobre o usuário-alvo do zero — contextualize: "Você mencionou entregadores cadastrados. Há alguma pré-condição que precisam cumprir além do cadastro?"

4. **Não pergunte o óbvio.** Se a feature é "login de entregador", não pergunte "Quem vai fazer o login?". Gere um rascunho razoável e pergunte apenas o que realmente falta.

5. **Aprofunde quando vago.** Se a resposta foi "funcionar bem" ou "o usual", pergunte por um exemplo concreto ou um número específico.

---

## Quando aceitar vs. aprofundar

**Aceite** quando:
- Todos os itens do checklist da seção estão cobertos
- As informações são específicas e verificáveis
- O rascunho gerado não tem lacunas evidentes

**Aprofunde** quando:
- A resposta é vaga ("algo que funcione", "o normal", "depende")
- Falta pelo menos um item obrigatório do checklist
- A resposta contradiz ou entra em conflito com seções anteriores
- O usuário descreve a solução em vez do problema (especialmente nas seções Problema e Objetivos)

---

## Banco de perguntas por seção

### 1. Visão Geral

Use quando o rascunho não está claro ou está incompleto.

- "Em uma frase: o que o entregador consegue fazer com essa feature que hoje não consegue?"
- "Qual é o mecanismo principal que o sistema usa para entregar isso? (ex: token, sessão, código SMS)"
- "Há alguma palavra-chave técnica que define como isso funciona que não ficou clara no rascunho?"

### 2. Problema

Use quando o problema está descrito como solução, ou quando o impacto não está claro.

- "O que acontece hoje quando um entregador tenta fazer [ação da feature]?"
- "Qual é a consequência concreta disso para o entregador no dia a dia?"
- "Por que esse problema precisa ser resolvido agora, e não em outra feature?"

### 3. Usuário-Alvo

Use quando o usuário-alvo é genérico ou quando há pré-condições implícitas.

- "Qualquer entregador pode usar isso, ou há algum pré-requisito? (ex: precisa ter conta criada, precisa ter passado por alguma etapa)"
- "Há algum entregador que *não* deve ter acesso a essa feature?"

### 4. Objetivos

Use quando os objetivos são vagos, contêm verbos fracos ("ser", "ter", "garantir") ou são insuficientes.

- "Além de [objetivo já listado], o sistema precisa fazer mais alguma coisa para entregar essa feature?"
- "O que exatamente o sistema faz quando [cenário específico]? Isso é um objetivo separado?"
- "O objetivo '[X]' é verificável? Como sabemos que foi implementado corretamente?"

### 5. Critérios de Sucesso

Use quando os critérios não são mensuráveis ou não cobrem cenários de erro.

- "Como saberemos que o happy path funcionou? O que o entregador vê ou recebe?"
- "O que acontece quando as credenciais estão erradas? Isso precisa ser um critério de sucesso?"
- "Há algum requisito de performance ou segurança que precisa estar nessa lista?"

### 6. Fora do Escopo

Use quando o escopo está vago ou quando o usuário não pensou no que deixar de fora.

- "O que um entregador poderia razoavelmente esperar dessa feature, mas que não será entregue agora?"
- "Existe alguma funcionalidade parecida (ex: logout, recuperação de senha) que poderia ser confundida com essa? Ela está explicitamente fora?"

### 7. Fluxo Principal

Use quando faltam passos, o ponto de entrada não está claro, ou o fluxo tem bifurcações.

- "Onde começa o fluxo? O entregador abre uma URL específica, ou chega de outro lugar?"
- "O que acontece exatamente depois de [passo X]? O que o sistema faz em seguida?"
- "Onde termina o fluxo? O que o entregador vê ou recebe ao final?"

### 8. Fluxo Alternativo

Use quando há um fluxo secundário relevante que não foi mencionado.

- "Existe algum fluxo que acontece em segundo plano ou de forma automática? (ex: renovação de token, retry)"
- "O que acontece se o entregador já estava autenticado e tenta acessar a feature de novo?"
- "Essa feature não tem fluxo alternativo? Podemos colocar 'N/A' com uma breve justificativa."

### 9. Dependências

Use quando dependências implícitas não foram mencionadas.

- "Essa feature depende de alguma outra feature do produto que precisa existir antes?"
- "Há alguma biblioteca ou serviço externo específico que vai ser usado?"
- "Existe alguma estrutura de banco de dados (tabela, coluna) que precisa existir antes?"

### 10. Riscos

Use quando não há riscos listados ou quando os riscos são genéricos demais.

- "O que poderia dar errado com essa feature que prejudicaria o entregador ou a segurança da plataforma?"
- "Como podemos mitigar [risco específico que você identificou no contexto da feature]?"
- "Há algum risco de segurança nessa feature? (autenticação, dados sensíveis, ações irreversíveis)"

---

## Sinais de alerta — respostas que pedem aprofundamento

| Resposta recebida | Problema | Como aprofundar |
|---|---|---|
| "Funcionar corretamente" | Não é mensurável | "O que significa 'corretamente' nesse caso? Qual seria um exemplo de sucesso?" |
| "Os usuários" (sem especificação) | Usuário-alvo genérico | "Que tipo de usuário especificamente? Entregador, admin, cliente?" |
| "Tudo que for necessário" (fora do escopo) | Não delimita nada | "Se você fosse listar 3 coisas que alguém poderia esperar mas não serão entregues, quais seriam?" |
| "Basicamente o fluxo normal" | Fluxo não descrito | "Pode descrever esse fluxo passo a passo, começando pelo que o usuário faz primeiro?" |
| "Depende da implementação" (nos objetivos) | Objetivo técnico demais | "Em termos de comportamento visível para o usuário, o que muda?" |
| Descreve a solução no "Problema" | Inversão de problema/solução | "Antes de pensar na solução: o que acontece hoje quando o usuário tenta fazer isso?" |

---

## Ritmo da entrevista

- Sempre anuncie em qual seção está: `[Seção 3/10: Usuário-Alvo]`
- Mostre o rascunho gerado antes de perguntar
- Após incorporar a resposta, mostre o rascunho atualizado e avalie em voz alta antes de perguntar mais ou avançar
- Quando uma seção estiver pronta, confirme: "Seção concluída. Avançando para [próxima seção]."
- Se o usuário quiser pular uma seção, aceite mas registre como "N/A — [razão dada pelo usuário]"
