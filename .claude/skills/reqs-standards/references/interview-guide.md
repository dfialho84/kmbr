# Guia de Entrevista — Criação de Requisitos Funcionais (EARS)

## Princípios da entrevista

1. **Uma pergunta por vez.** Nunca faça duas perguntas na mesma mensagem.

2. **Os três artefatos são as fontes primárias.** Derive o máximo possível do PRD, das Stories e dos cenários BDD antes de perguntar. Perguntas são para lacunas que os artefatos não respondem.

3. **Perguntas abertas, não de confirmação.** Prefira "O que acontece quando a sessão expira durante o cadastro?" a "O sistema deve redirecionar para o login nesse caso?".

4. **Foco em obrigação do sistema, não em comportamento do usuário.** O requisito descreve o que o sistema **deve fazer**, não o que o usuário faz.

5. **Não crie requisitos para itens fora do escopo.** Se o usuário pedir um requisito para algo na seção "Fora do Escopo" do PRD, recuse gentilmente citando o trecho.

---

## Quando aceitar vs. aprofundar um rascunho

**Aceite** quando:
- O requisito usa o padrão EARS correto para o tipo de comportamento
- O verbo `shall` está presente
- O comportamento é verificável por um teste
- Não há menção a tecnologia, biblioteca ou framework
- O vocabulário é consistente com o PRD

**Aprofunde** quando:
- O comportamento é vago ("o sistema deve lidar com erros")
- O requisito menciona tecnologia ("the system shall store the JWT in Redis")
- O padrão EARS está errado (ex: usar `When` para uma condição de falha, que deveria ser `If`)
- O requisito descreve o que o usuário faz, não o que o sistema faz
- O comportamento não é verificável por um teste
- Dois comportamentos distintos estão no mesmo requisito

---

## Banco de perguntas por tipo de lacuna

### Padrão EARS incorreto

Use quando o rascunho usa o padrão errado para o contexto.

- "Esse comportamento ocorre sempre (ubíquo), quando algo acontece (evento), enquanto um estado persiste (estado), ou quando algo falha (indesejado)?"
- "Esse é um comportamento de erro ou de fluxo normal? Isso define se usamos `If` ou `When`."

### Comportamento vago

Use quando o `shall <behavior>` é genérico demais.

- "O que exatamente o sistema deve fazer quando isso acontece? Qual é a resposta observável?"
- "Como um QA saberia, apenas testando o sistema, que esse requisito foi atendido?"
- "Há uma mensagem específica, um redirecionamento, um estado visível que representa esse comportamento?"

### Condição/evento pouco preciso

Use quando o `When <event>` ou `If <condition>` está vago.

- "O que caracteriza especificamente esse evento? O que distingue esse cenário de outros parecidos?"
- "Essa condição tem variações? Por exemplo, campo vazio é diferente de formato inválido?"
- "Qual é o gatilho exato que dispara esse comportamento do sistema?"

### Tecnologia mencionada

Use quando o requisito menciona implementação.

- "Como você descreveria esse comportamento sem mencionar como ele é implementado?"
- "Do ponto de vista do negócio, o que o sistema deve fazer — sem citar banco, token ou biblioteca?"

### Cobertura do conjunto

Use quando o conjunto de requisitos parece incompleto.

- "O cenário BDD '[título]' ainda não tem um requisito correspondente. Qual obrigação do sistema ele implica?"
- "O critério de aceitação '[critério]' da Estória [N] está coberto por algum requisito? Se não, qual comportamento obrigatório ele define?"
- "Há alguma condição de falha no PRD que ainda não gerou um requisito com `If`?"

---

## Quando aceitar respostas de "N/A"

Se o usuário disser que algo não se aplica (ex: "não precisamos de requisito para isso"):
- Registre internamente e avance para o próximo item
- Não insista
- Se for uma lacuna óbvia (ex: nenhum cenário de erro tem requisito), mencione uma vez e aceite a decisão

---

## Ritmo da entrevista

- Sempre anuncie qual requisito está sendo construído: `[Requisito X/<N>: <Título>]`
- Mostre o rascunho EARS gerado antes de perguntar
- Após incorporar a resposta, mostre o rascunho atualizado
- Quando um requisito estiver pronto: `✅ Requisito <N> concluído.`
- Aceite pedidos de pular ou remover requisitos sem resistência; ajuste a numeração implícita

---

## Como derivar requisitos dos cenários BDD (processo passo a passo)

Para cada cenário `Scenario: <Título>`:

1. Leia o `When` — esse é o **evento** ou **condição**
2. Leia o `Then` — esse é o **comportamento esperado do sistema**
3. Escolha o padrão EARS:
   - `When` do cenário é uma ação normal → padrão `When <event>, the system shall <behavior>`
   - `When` do cenário é uma condição de falha → padrão `If <condition>, the system shall <behavior>`
4. Se o `Then` tiver `And`, avalie se os comportamentos adicionais merecem requisitos separados
5. Escreva o requisito em inglês, com vocabulário de domínio

### Exemplo de derivação

Cenário BDD:
```gherkin
Scenario: Successful registration
  Given a new delivery driver on the registration form
  When valid registration data is submitted
  Then the driver account is created
  And the driver receives a confirmation email
```

Requisitos derivados:
```
REQ-1: When valid registration data is submitted, the system shall create a delivery driver account.
REQ-2: When a delivery driver account is successfully created, the system shall send a confirmation email to the registered address.
```

---

## Sinais de alerta — rascunhos que pedem aprofundamento

| Problema observado | Como aprofundar |
|---|---|
| `shall` ausente (ex: "the system should") | "Usamos `shall` para indicar obrigação. Esse comportamento é obrigatório?" |
| Tecnologia no requisito ("shall save to MySQL") | "Como descrever isso sem mencionar a tecnologia de persistência?" |
| Comportamento vago ("shall handle errors") | "Que comportamento específico o sistema deve ter quando ocorre um erro?" |
| `When` usado para condição de falha | "Esse é um cenário de erro — deveria usar `If` em vez de `When`." |
| Dois comportamentos em um requisito | "Esses são dois comportamentos distintos. Faz sentido separar em dois requisitos?" |
| Requisito descreve ação do usuário | "O requisito deve descrever o que o sistema faz, não o que o usuário faz." |
