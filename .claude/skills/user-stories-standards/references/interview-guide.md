# Guia de Entrevista — Criação de Estórias de Usuário

## Princípios da entrevista

1. **Uma pergunta por vez.** Nunca faça duas perguntas na mesma mensagem. O usuário perde o fio quando precisa responder múltiplas coisas de uma vez.

2. **O PRD é a fonte primária.** Antes de perguntar qualquer coisa, derive o máximo possível do PRD. Perguntas são para lacunas que o PRD não responde.

3. **Perguntas abertas, não de confirmação.** Prefira "Qual é o benefício concreto para o entregador aqui?" a "O benefício é poder continuar usando o sistema?".

4. **Contextualize com o PRD.** Se o PRD define o usuário-alvo como "entregador com conta criada via register-user", não pergunte "quem usa essa feature?".

5. **Aprofunde quando vago.** Se o usuário diz "validar os dados", pergunte "Quais dados especificamente e o que caracteriza um dado inválido nesse contexto?".

6. **Não crie estórias além do escopo.** Se o usuário pedir uma estória para algo na seção "Fora do Escopo" do PRD, recuse gentilmente citando o trecho do PRD.

---

## Quando aceitar vs. aprofundar

**Aceite** quando:
- Todos os itens do checklist da estória estão cobertos
- Os critérios de aceitação são específicos e verificáveis
- A persona e o benefício são consistentes com o PRD

**Aprofunde** quando:
- O "para que" é trivial ou genérico ("para usar o sistema", "para funcionar")
- Um critério de aceitação é vago ("o sistema deve funcionar corretamente")
- A persona é genérica ("o usuário", "alguém")
- Um critério menciona detalhes técnicos de implementação
- A estória cobre dois fluxos distintos ao mesmo tempo (candidata a ser dividida)

---

## Banco de perguntas por parte da estória

### Cabeçalho — "Como"

Use quando a persona não está clara ou é genérica.

- "O PRD define o usuário-alvo como [X]. Essa estória é para o mesmo usuário, ou há uma persona diferente envolvida?"
- "Há alguma pré-condição que o entregador precisa cumprir para chegar neste ponto do fluxo?"

### Cabeçalho — "Eu quero"

Use quando a ação está descrita em termos técnicos ou é vaga.

- "Como o entregador experimentaria essa capacidade? O que ele faria ou veria?"
- "Se você fosse descrever o que o entregador consegue fazer com isso em uma frase para alguém não técnico, como ficaria?"

### Cabeçalho — "Para que"

Use quando o benefício é genérico ou não está explícito no PRD.

- "Qual é o resultado concreto para o entregador quando essa estória está implementada? O que muda para ele?"
- "Por que isso é importante para o entregador no contexto do trabalho dele?"

### Critérios de aceitação — happy path

Use quando o critério do caminho feliz está faltando ou é vago.

- "O que o entregador vê ou recebe quando tudo ocorre como esperado nesta estória?"
- "Como o sistema confirma que a ação do entregador foi bem-sucedida?"

### Critérios de aceitação — cenário de erro/validação

Use quando não há critério de falha ou validação.

- "O que acontece quando [dado inválido ou condição de erro relevante para esta estória]?"
- "O PRD menciona [objetivo de rejeição/validação]. Isso precisa aparecer como critério nessa estória?"

### Critérios de aceitação — especificidade

Use quando um critério está vago ou não é verificável.

- "O que significa '[critério vago]' nesse contexto? Pode dar um exemplo concreto de 'passou' e 'falhou'?"
- "Um desenvolvedor conseguiria escrever um teste para esse critério como está? O que ele verificaria exatamente?"

### Divisão de estórias

Use quando a estória parece cobrir dois fluxos distintos.

- "Essa estória cobre [fluxo A] e [fluxo B]. Faz sentido separá-las para que cada uma seja mais focada?"
- "O [fluxo B] precisa estar implementado antes do [fluxo A], ou são independentes?"

---

## Sinais de alerta — respostas que pedem aprofundamento

| Resposta recebida | Problema | Como aprofundar |
|---|---|---|
| "Para que eu possa usar o sistema" | Benefício trivial | "Qual problema específico isso resolve para o entregador no dia a dia?" |
| "O sistema deve funcionar corretamente" | Critério não verificável | "O que 'corretamente' significa aqui? Qual seria um exemplo de sucesso e de falha?" |
| "Validar os dados" (sem especificar quais) | Critério vago | "Quais dados especificamente? O que os torna inválidos nesse contexto?" |
| "O usuário" ou "alguém" (na persona) | Persona genérica | "Esse é o mesmo entregador definido no PRD, ou há outro tipo de usuário envolvido?" |
| Critério que menciona JWT, bcrypt, tabela | Detalhe técnico | "Como o entregador perceberia isso externamente, sem saber como está implementado?" |
| Uma estória com 7+ critérios | Estória grande demais | "Esses critérios cobrem mais de um fluxo? Pode fazer sentido dividir em duas estórias." |

---

## Ritmo da entrevista

- Sempre anuncie qual estória está sendo construída: `[Estória 2/5: Validação de dados]`
- Mostre o rascunho gerado antes de perguntar
- Após incorporar a resposta, mostre o rascunho atualizado e avalie em voz alta antes de perguntar mais ou avançar
- Quando uma estória estiver pronta, confirme: `✅ Estória <N> concluída. Avançando para [próxima estória].`
- Se o usuário quiser pular ou remover uma estória do índice, aceite e ajuste a numeração das seguintes

---

## Como derivar estórias do PRD

### Da seção Objetivos

- Objetivos com verbo **"Permitir"** → estória de caminho feliz (o que o usuário consegue fazer)
- Objetivos com verbo **"Rejeitar"** → estória de validação (o que o sistema bloqueia)
- Objetivos com verbo **"Validar"** ou **"Detectar"** → estória de validação
- Objetivos muito granulares relacionados ao mesmo fluxo → podem ser agrupados em uma única estória

### Da seção Fluxo Principal

- Cada **entrada significativa do usuário** no fluxo (não cada passo técnico do sistema) tende a virar uma estória
- Passos puramente internos do sistema (ex: "sistema valida token", "sistema emite JWT") aparecem nos critérios de aceitação, não como estórias separadas

### Da seção Fluxos Alternativos

- Cada fluxo alternativo com **impacto perceptível ao usuário** → estória de caso de falha
- Fluxos alternativos puramente técnicos sem ação do usuário → não viram estórias

### Da seção Riscos

- Riscos cuja **mitigação é visível ao usuário** (ex: bloqueio por tentativas excessivas) → estória de segurança
- Riscos puramente técnicos (ex: "JWT assinado com secret de 256 bits") → não viram estórias

### Da seção Fora do Escopo

- Use exclusivamente como **filtro negativo**: se uma estória candidata cobre algo listado aqui, descarte-a e informe o usuário
